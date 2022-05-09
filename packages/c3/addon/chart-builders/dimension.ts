/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Logic for grouping chart data by many dimensions
 *
 * Usage:
 * series: {
 *    type: 'dimension',
 *    config: {
 *        dimensionOrder: [ dim1, dim2 ],
 *        metric: metric,
 *        dimensions: [
 *              {
 *                  name: 'All Other',
 *                  values: {dim1: x, dim2: y}
 *              },{
 *                  name: 'Under 13',
 *                  values: {dim1: a, dim2: b}
 *             }
 *          ]
 *    }
 *}
 */
import Mixin from '@ember/object/mixin';
import EmberObject, { computed } from '@ember/object';
import { assert } from '@ember/debug';
import moment, { MomentInput } from 'moment';
import DataGroup from 'navi-core/utils/classes/data-group';
import { API_DATE_FORMAT_STRING } from 'navi-data/utils/date';
//@ts-ignore
import tooltipLayout from '../templates/chart-tooltips/dimension';
import ChartAxisDateTimeFormats from 'navi-core/utils/chart-axis-date-time-formats';
import { groupDataByDimensions } from '@yavin/c3/utils/chart-data';
import { BaseChartBuilder, C3Row, EmptyC3Data, TooltipData } from './base';
import RequestFragment from 'navi-core/models/request';
import { tracked } from '@glimmer/tracking';
import { DimensionSeries } from '@yavin/c3/models/chart-visualization';
import NaviFactResponse, { ResponseRow } from 'navi-data/models/navi-fact-response';
import ColumnFragment from 'navi-core/models/request/column';

const BLANK_X_VALUE = '';

export default class DimensionChartBuilder extends EmberObject implements BaseChartBuilder {
  @tracked byXSeries?: DataGroup<ResponseRow>;

  /**
   * @param row - single row of fact data
   * @param config - series config
   * @param request - request used to query fact data
   * @returns name of series given row belongs to
   */
  getSeriesName(row: ResponseRow, _config: DimensionSeries['config'], request: RequestFragment): string {
    return request.nonTimeDimensions.map((dim) => row[dim.canonicalName]).join(',');
  }

  /**
   * @inheritdoc
   */
  getXValue(row: ResponseRow, _config: DimensionSeries['config'], request: RequestFragment): string {
    const { timeGrainColumn } = request;
    if (timeGrainColumn) {
      const colName = timeGrainColumn.canonicalName;
      const date = row[colName];
      if (typeof date !== 'string') {
        return BLANK_X_VALUE;
      }
      return moment(date).format(API_DATE_FORMAT_STRING);
    }
    return BLANK_X_VALUE;
  }

  /**
   * @inheritdoc
   */
  buildData(
    response: NaviFactResponse,
    config: DimensionSeries['config'],
    request: RequestFragment
  ): { series: C3Row[]; names: Record<string, string> } {
    assert('response should be a NaviFactResponse instance', response instanceof NaviFactResponse);

    // Group data by x axis value + series name in order to lookup trends when building tooltip
    this.byXSeries = new DataGroup(response.rows, (row) => {
      return `${this.getXValue(row, config, request)} ${this.getSeriesName(row, config, request)}`;
    });

    const { metricCid } = config;
    const metric = request.columns.find(({ cid }) => cid === metricCid);
    if (!metric) {
      return EmptyC3Data;
    }

    const { timeGrain, nonTimeDimensions } = request;
    const seriesKey = config.dimensions.map((s) => nonTimeDimensions.map((d) => s.values[d.cid]).join('|')); // Build the series required

    const names = config.dimensions.reduce((names: Record<string, string>, series, index) => {
      names[`series.${index}`] = series.name;
      return names;
    }, {});

    if (timeGrain) {
      if (!(request.timeGrainColumn && response.getIntervalForTimeDimension(request.timeGrainColumn))) {
        return EmptyC3Data;
      }
      const timeGrainColumnName = request.timeGrainColumn.canonicalName;
      const interval = response.getIntervalForTimeDimension(request.timeGrainColumn);
      assert('request should have an interval', interval);

      const buildDateKey = (dateTime: MomentInput) => moment(dateTime).format(API_DATE_FORMAT_STRING);
      const byDate = new DataGroup(response.rows, (row) => buildDateKey(row[timeGrainColumnName] as string)); // Group by dates for easier lookup
      // For each unique date, build the series
      const series = interval
        .makeEndExclusiveFor(timeGrain)
        .getDatesForInterval(timeGrain)
        .map((date) => {
          const key = buildDateKey(date);
          const rows = byDate.getDataForKey(key) || [];
          const displayValue = moment(date).format(ChartAxisDateTimeFormats[timeGrain]);
          return this.buildC3Row(key, displayValue, rows, seriesKey, metric, nonTimeDimensions);
        });
      return { series, names };
    }
    const series = [this.buildC3Row(BLANK_X_VALUE, BLANK_X_VALUE, response.rows, seriesKey, metric, nonTimeDimensions)];
    return { series, names };
  }

  /**
   *  Builds c3 row
   */
  private buildC3Row(
    value: string,
    displayValue: string,
    rows: ResponseRow[],
    seriesKey: string[],
    metric: ColumnFragment,
    nonTimeDimensions: ColumnFragment[]
  ): C3Row {
    // Group the dimension required
    const byDim = groupDataByDimensions(rows, nonTimeDimensions);

    // the data for date used in the C3 chart
    const c3row: C3Row = {
      x: { rawValue: value, displayValue },
    } as C3Row;

    // Adding the series to the keys
    seriesKey.forEach((s, index) => {
      //Handling the case when some of the data group does not exist
      if (byDim.getDataForKey(s) && byDim.getDataForKey(s).length) {
        // Extending the data for date with the grouped dimension and metric value
        Object.assign(c3row, {
          [`series.${index}`]: byDim.getDataForKey(s)[0][metric.canonicalName],
        });
      } else {
        // Returning null for the chart to show missing data
        Object.assign(c3row, { [`series.${index}`]: null });
      }
    });

    /**
     * sample of return:
     * x: {
     *    rawValue: '2016-05-30 00:00:00.000',
     *    displayValue: 'May 30'
     *  },
     *  'All Other | M': 828357,
     *  'Under 15 | F' : 26357
     */

    // Return the data for Date
    return c3row;
  }

  /**
   * @inheritdoc
   */
  buildTooltip(_config: DimensionSeries['config'], _request: RequestFragment) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let builder = this;

    return Mixin.create({
      layout: tooltipLayout,

      /**
       * @property {Object[]} rowData - maps a response row to each series in a tooltip
       */
      rowData: computed('x', 'tooltipData', function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.tooltipData.map((series: TooltipData) => {
          // Get the full data for this combination of x + series
          let dataForSeries = builder.byXSeries?.getDataForKey(`${this.x} ${series.name}`) || [];

          return dataForSeries[0];
        });
      }),
    });
  }
}
