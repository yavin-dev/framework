/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Logic for grouping chart data by time
 *
 * Usage:
 *   series: {
 *     type: 'dateTime'
 *     config: {
 *       timeGrain: 'year',
 *       metric: 'pageViews'
 *     }
 *   }
 */
import Mixin from '@ember/object/mixin';
import moment, { Moment, MomentInput } from 'moment';
//@ts-ignore
import tooltipLayout from '../templates/chart-tooltips/date';
import DataGroup from 'navi-core/utils/classes/data-group';
import EmberObject, { computed } from '@ember/object';
import { assert } from '@ember/debug';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { BaseChartBuilder, C3Row, EmptyC3Data, TooltipData } from './base';
import { tracked } from '@glimmer/tracking';
import { DateTimeSeries } from 'navi-core/models/chart-visualization';
import NaviFactResponse, { ResponseRow } from 'navi-data/models/navi-fact-response';

const API_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';
const YEAR_WITH_53_ISOWEEKS = '2015-01-01';

interface Grouper {
  xValueCount: number;
  getXValue: (dateTime: Moment) => number;
  getXDisplay: (x: number) => string;
  getSeries: (dateTime: Moment) => string;
}

/**
 * @constant {Object} logic for grouping one time grain by another
 * TODO support more combinations
 */
export const GROUP: Record<string, { by: Record<string, Grouper | undefined> } | undefined> = {
  /*
   * Example:
   *   day: {
   *     by: {
   *       month: {
   *         xValueCount: 31,                                    31 possible days in a month
   *         getXValue: dateTime => dateTime.date(),             Given a date, group it into one of the 31 days defined above
   *         getXDisplay: x => 'Day ' + x,                       Labels displayed on the chart x axis should be "Day 1", "Day 2", etc
   *         getSeries: dateTime => dateTime.format('MMM YYYY')  Series display name by month and year -> May 2016, Jun 2016, Jul 2016
   *       }
   *     }
   *   }
   */

  second: {
    by: {
      minute: {
        xValueCount: 61,
        getXValue: (dateTime: Moment) => dateTime.second() + 1,
        getXDisplay: (x: number) => 'Second ' + x,
        getSeries: (dateTime: Moment) => dateTime.format('MMM D HH:mm')
      }
    }
  },
  minute: {
    by: {
      hour: {
        xValueCount: 60,
        getXValue: (dateTime: Moment) => dateTime.minute() + 1,
        getXDisplay: (x: number) => 'Minute ' + x,
        getSeries: (dateTime: Moment) => dateTime.format('MMM D HH:00')
      }
    }
  },
  hour: {
    by: {
      day: {
        xValueCount: 24,
        getXValue: (dateTime: Moment) => dateTime.hour() + 1,
        getXDisplay: (x: number) => 'Hour ' + x,
        getSeries: (dateTime: Moment) => dateTime.format('MMM D')
      }
    }
  },
  day: {
    by: {
      month: {
        xValueCount: 31,
        getXValue: (dateTime: Moment) => dateTime.date(),
        getXDisplay: (x: number) => 'Day ' + x,
        getSeries: (dateTime: Moment) => dateTime.format('MMM YYYY')
      },
      year: {
        xValueCount: 366,
        getXValue: (dateTime: Moment) => dateTime.dayOfYear(),
        getXDisplay: (x: number) =>
          moment()
            .dayOfYear(x)
            .format('MMM'),
        getSeries: (dateTime: Moment) => dateTime.format('YYYY')
      }
    }
  },
  week: {
    by: {
      year: {
        xValueCount: 53,
        getXValue: (dateTime: Moment) => dateTime.isoWeek(),
        getXDisplay: (x: number) =>
          moment(YEAR_WITH_53_ISOWEEKS)
            .isoWeek(x)
            .format('MMM'),
        getSeries: (dateTime: Moment) => dateTime.format('GGGG')
      }
    }
  },
  month: {
    by: {
      year: {
        xValueCount: 12,
        getXValue: (dateTime: Moment) => dateTime.month() + 1,
        getXDisplay: (x: number) =>
          moment()
            .month(x - 1)
            .format('MMM'),
        getSeries: (dateTime: Moment) => dateTime.format('YYYY')
      }
    }
  }
};

type SeriesMap = Record<string, Record<string, number | undefined> | undefined>;
/**
 * Group data by series, then x value, in order to easily build c3's json format
 *
 * @param data - rows of chart data to group
 * @param timeGrainColumn - time grain column to use name
 * @param metric - metric name
 * @param grouper - series grouping logic
 * @returns metric value grouped by series and x value
 */
function _groupDataBySeries(data: ResponseRow[], timeGrainColumn: string, metric: string, grouper: Grouper): SeriesMap {
  return data.reduce((map: SeriesMap, row: ResponseRow) => {
    const date = moment(row[timeGrainColumn] as MomentInput, API_DATE_FORMAT);
    const series = grouper.getSeries(date);
    const x = grouper.getXValue(date);

    let seriesValue = map[series];
    if (seriesValue === undefined) {
      seriesValue = {};
    }
    seriesValue[`${x}`] = row[metric] as number;

    map[series] = seriesValue;

    return map;
  }, {}) as SeriesMap;
}

/**
 * Convert seriesMap to data rows
 *
 * @param seriesMap - data index by series and x value
 * @param grouper - series grouping logic
 * @returns array of c3 data with x values
 */
function _buildDataRows(seriesMap: SeriesMap, grouper: Grouper): { series: C3Row[]; names: Record<string, string> } {
  let _buildRow = (x: number) => {
    let row = ({
      x: {
        rawValue: x,
        displayValue: grouper.getXDisplay(x)
      }
    } as unknown) as C3Row;

    // Add each series to the row
    Object.keys(seriesMap).forEach((series, index) => {
      const val = seriesMap[series]?.[`${x}`];
      row[`series.${index}`] = typeof val === 'number' ? val : null; // c3 wants `null` for empty data points
    });

    return row;
  };

  const series = [];
  for (let x = 1; x <= grouper.xValueCount; x++) {
    series.push(_buildRow(x));
  }

  const names = Object.keys(seriesMap).reduce((names: Record<string, string>, series, index) => {
    names[`series.${index}`] = series;
    return names;
  }, {});
  return { series, names };
}

/**
 * Gets the grouper for a given config and request
 *
 * @param request - request used to query fact data
 * @param config - series config
 * @returns grouper for request and config
 */
function _getGrouper(request: RequestFragment, config: DateTimeSeries['config']): Grouper {
  const { timeGrain } = request;
  const seriesTimeGrain = config.timeGrain;
  assert(`timeGrain should be defined`, timeGrain);
  assert(`timeGrain ${timeGrain} should be in the supported groupers`, Object.keys(GROUP).includes(timeGrain));
  const groupGrain = timeGrain as keyof typeof GROUP;

  const grouper = GROUP[groupGrain]?.by[seriesTimeGrain];
  assert(`Grouper for ${timeGrain} by ${seriesTimeGrain} should exist`, grouper);
  return grouper;
}

export default class TimeChartBuilder extends EmberObject implements BaseChartBuilder {
  @tracked byXSeries?: DataGroup<ResponseRow>;

  /**
   * @param row - single row of fact data
   * @param config - series config
   * @param request - request used to query fact data
   * @returns name of series given row belongs to
   */
  getSeriesName(row: ResponseRow, config: DateTimeSeries['config'], request: RequestFragment): string {
    assert('request should have a timeGrainColumn', request.timeGrainColumn);
    const colName = request.timeGrainColumn.canonicalName;
    const date = row[colName];
    assert(`a date for ${colName} should be found, but got: ${date}`, typeof date === 'string');
    return _getGrouper(request, config).getSeries(moment(date));
  }

  getXValue(row: ResponseRow, config: DateTimeSeries['config'], request: RequestFragment): number {
    assert('request should have a timeGrainColumn', request.timeGrainColumn);
    const colName = request.timeGrainColumn.canonicalName;
    const date = row[colName];
    assert(`a date for ${colName} should be found, but got: ${date}`, typeof date === 'string');
    return _getGrouper(request, config).getXValue(moment(date));
  }

  buildData(
    response: NaviFactResponse,
    config: DateTimeSeries['config'],
    request: RequestFragment
  ): { series: C3Row[]; names: Record<string, string> } {
    assert('response should be a NaviFactResponse instance', response instanceof NaviFactResponse);
    if (!(request.timeGrainColumn && response.getIntervalForTimeDimension(request.timeGrainColumn))) {
      return EmptyC3Data;
    }

    // Group data by x axis value + series name in order to lookup metric attributes when building tooltip
    this.byXSeries = new DataGroup(response.rows, row => {
      let seriesName = this.getSeriesName(row, config, request),
        x = this.getXValue(row, config, request);
      return x + seriesName;
    });

    const grouper = _getGrouper(request, config);
    let { metricCid } = config;
    const metric = request.columns.find(c => c.cid === metricCid);
    if (!metric) {
      return EmptyC3Data;
    }

    let seriesMap = _groupDataBySeries(
      response.rows,
      request.timeGrainColumn.canonicalName,
      metric.canonicalName,
      grouper
    );
    return _buildDataRows(seriesMap, grouper);
  }

  /**
   * @param _config
   * @param _request
   * @returns {Object} object with tooltip template and rendering context
   */
  buildTooltip(_config: DateTimeSeries['config'], _request: RequestFragment) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let builder = this;

    // eslint-disable-next-line ember/no-new-mixins
    return Mixin.create({
      layout: tooltipLayout,

      /**
       * @property {Object[]} rowData - maps a response row to each series in a tooltip
       */
      rowData: computed('x', 'tooltipData', function() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.tooltipData.map((series: TooltipData) => {
          // Get the full data for this combination of x + series
          let dataForSeries = builder.byXSeries?.getDataForKey(this.x + series.name) || [];

          return dataForSeries[0];
        });
      })
    });
  }
}
