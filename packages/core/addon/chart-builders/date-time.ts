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
import { BaseChartBuilder, C3Row } from './base';
import { tracked } from '@glimmer/tracking';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import { DateTimeSeries } from 'navi-core/models/line-chart';

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

/**
 * Group data by series, then x value, in order to easily build c3's json format
 *
 * @param data - rows of chart data to group
 * @param timeGrainColumn - time grain column to use name
 * @param metric - metric name
 * @param grouper - series grouping logic
 * @returns metric value grouped by series and x value
 */
const _groupDataBySeries = (data: ResponseRow[], timeGrainColumn: string, metric: string, grouper: Grouper) => {
  return data.reduce((map: Record<string, Record<string, number | undefined> | undefined>, row) => {
    const date = moment(row[timeGrainColumn] as MomentInput, API_DATE_FORMAT);
    const series = grouper.getSeries(date);
    const x = grouper.getXValue(date);

    if (!map[series]) {
      map[series] = {};
    }

    map[series][`${x}`] = row[metric] as number;

    return map;
  }, {});
};

/**
 * Convert seriesMap to data rows
 *
 * @param seriesMap - data index by series and x value
 * @param grouper - series grouping logic
 * @returns {Array} array of c3 data with x values
 */
function _buildDataRows(seriesMap, grouper: Grouper): C3Row[] {
  let _buildRow = (x: number) => {
    let row = ({
      x: {
        rawValue: x,
        displayValue: grouper.getXDisplay(x)
      }
    } as unknown) as C3Row;

    // Add each series to the row
    Object.keys(seriesMap).forEach(series => {
      const val = seriesMap[series][`${x}`];
      row[series] = typeof val === 'number' ? val : null; // c3 wants `null` for empty data points
    });

    return row;
  };

  let rows = [];
  for (let x = 1; x <= grouper.xValueCount; x++) {
    rows.push(_buildRow(x));
  }

  return rows;
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

type ResponseRow = ResponseV1['rows'][number];

export default class TimeChartBuilder extends EmberObject implements BaseChartBuilder {
  @tracked byXSeries?: DataGroup<ResponseRow>;

  /**
   * @param row - single row of fact data
   * @param config - series config
   * @param request - request used to query fact data
   * @returns name of series given row belongs to
   */
  getSeriesName(row: ResponseRow, config: DateTimeSeries['config'], request: RequestFragment): string {
    const date = row[request.timeGrainColumn.canonicalName] as MomentInput;
    return _getGrouper(request, config).getSeries(moment(date));
  }

  getXValue(row: ResponseRow, config: DateTimeSeries['config'], request: RequestFragment): number {
    const date = row[request.timeGrainColumn.canonicalName] as MomentInput;
    return _getGrouper(request, config).getXValue(moment(date));
  }

  buildData(response: ResponseV1, config: DateTimeSeries['config'], request: RequestFragment): C3Row[] {
    // Group data by x axis value + series name in order to lookup metric attributes when building tooltip
    this.byXSeries = new DataGroup(response.rows, row => {
      let seriesName = this.getSeriesName(row, config, request),
        x = this.getXValue(row, config, request);
      return x + seriesName;
    });

    const grouper = _getGrouper(request, config);
    let { metricCid } = config;
    const metric = request.columns.find(c => c.cid === metricCid);
    assert(`a metric with cid ${metricCid} should be found`, metric);

    let seriesMap = _groupDataBySeries(
      response.rows,
      request.timeGrainColumn.canonicalName,
      metric.canonicalName,
      grouper
    );
    return _buildDataRows(seriesMap, grouper);
  }

  /**
   * @param config
   * @returns {Object} object with tooltip template and rendering context
   */
  buildTooltip(_config: DateTimeSeries['config'], _request: RequestFragment) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let builder = this;

    return Mixin.create({
      layout: tooltipLayout,

      /**
       * @property {Object[]} rowData - maps a response row to each series in a tooltip
       */
      rowData: computed('x', 'tooltipData', function() {
        return this.tooltipData.map(series => {
          // Get the full data for this combination of x + series
          let dataForSeries = builder.byXSeries?.getDataForKey(this.x + series.name) || [];

          return dataForSeries[0];
        });
      })
    });
  }
}
