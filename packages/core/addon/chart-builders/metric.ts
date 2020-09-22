/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Logic for grouping chart data by many metrics
 *
 * Usage:
 *   series: {
 *     type: 'metric'
 *     config: {
 *       metrics: ['pageViews', 'adClicks']
 *     }
 *   }
 */
import Mixin from '@ember/object/mixin';
import { assert } from '@ember/debug';
import moment, { MomentInput } from 'moment';
//@ts-ignore
import tooltipLayout from '../templates/chart-tooltips/metric';
import ChartAxisDateTimeFormats from 'navi-core/utils/chart-axis-date-time-formats';
import DataGroup from 'navi-core/utils/classes/data-group';
import { API_DATE_FORMAT_STRING, getDatesForInterval } from 'navi-core/utils/date';
import EmberObject, { set, computed } from '@ember/object';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

type ResponseRow = ResponseV1['rows'][number];

export default class MetricChartBuilder extends EmberObject {
  byXSeries?: DataGroup<ResponseRow>;

  /**
   * @param row - single row of fact data
   * @returns name of x value given row belongs to
   */
  getXValue(row: ResponseRow, timeGrainColumn: string): string {
    // expects timeGrainColumn values to be a readable moment input
    const date = row[timeGrainColumn] as MomentInput;
    return moment(date).format(API_DATE_FORMAT_STRING);
  }

  /**
   * @function buildData
   * @param {Object} data - response from fact service
   * @param {Object} config
   * @param {Array} config.metrics - list of metrics to chart
   * @param {Object} request - request used to get data
   * @returns {Array} array of c3 data with x values
   */
  buildData(data: ResponseV1['rows'], _config: unknown, request: RequestFragment) {
    const timeGrainColumn = request.timeGrainColumn.canonicalName;
    const { timeGrain, interval } = request;
    assert('request should have an interval', interval);
    assert('request should have a timeGrain', timeGrain);
    // Group data by x axis value in order to lookup row data when building tooltip
    set(this, 'byXSeries', new DataGroup(data, (row: ResponseRow) => this.getXValue(row, timeGrainColumn)));

    // Support different `dateTime` formats by mapping them to a standard
    const buildDateKey = (dateTime: MomentInput) => moment(dateTime).format(API_DATE_FORMAT_STRING);

    /*
     * Get all date buckets spanned by the data,
     * and group data by date for easier lookup
     */
    const dates = getDatesForInterval(interval, timeGrain);
    const byDate = new DataGroup(data, (row: ResponseRow) => buildDateKey(row[timeGrainColumn] as MomentInput));

    // Make a data point for each date in the request, so c3 can correctly show gaps in the chart
    return dates.map(date => {
      const key = buildDateKey(date);
      const rowsForDate = byDate.getDataForKey(key) || [];
      const row = rowsForDate[0] || {}; // Metric series expects only one data row for each date

      const x = {
        rawValue: key,
        displayValue: date.format(ChartAxisDateTimeFormats[timeGrain])
      };

      // Build an object consisting of x value and requested metrics
      return Object.assign(
        { x },
        ...request.metricColumns.map(metric => {
          const metricValue = row[metric.canonicalName];
          return {
            [metric.displayName]: typeof metricValue === 'number' ? metricValue : null
          }; // c3 wants `null` for empty data points
        })
      );
    });
  }

  /**
   * @function buildTooltip
   * @returns {Object} layout for tooltip
   */
  buildTooltip(_config: unknown, _request: RequestFragment) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let builder = this;

    return Mixin.create({
      layout: tooltipLayout,

      /**
       * @property {Object[]} rowData - maps a response row to each series in a tooltip
       */
      rowData: computed('x', 'tooltipData', function() {
        return this.tooltipData.map(() => {
          // Get the full data for this combination of x + series
          const dataForSeries = builder.byXSeries?.getDataForKey(this.x) || [];
          return dataForSeries[0];
        });
      })
    });
  }
}
