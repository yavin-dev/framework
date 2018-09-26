/**
 * Copyright 2018, Yahoo Holdings Inc.
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
import Ember from 'ember';
import moment from 'moment';
import tooltipLayout from '../templates/chart-tooltips/metric';
import ChartAxisDateTimeFormats from 'navi-core/utils/chart-axis-date-time-formats';
import DataGroup from 'navi-core/utils/classes/data-group';
import Interval from 'navi-core/utils/classes/interval';
import DateUtils from 'navi-core/utils/date';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { inject as service } from '@ember/service';
import { get, set, getWithDefault } from '@ember/object';

export default Ember.Object.extend({
  /**
   * @property {Service} metricName
   */
  metricName: service(),

  /**
   * @method getXValue
   * @param {Object} row - single row of fact data
   * @returns {String} name of x value given row belongs to
   */
  getXValue: row => moment(row.dateTime).format(DateUtils.API_DATE_FORMAT_STRING),

  /**
   * @function buildData
   * @param {Object} data - response from fact service
   * @param {Object} config
   * @param {Array} config.metrics - list of metrics to chart
   * @param {Object} request - request used to get data
   * @returns {Array} array of c3 data with x values
   */
  buildData(data, config, request) {
    // Group data by x axis value in order to lookup row data when building tooltip
    set(this, 'byXSeries', new DataGroup(data, row => this.getXValue(row)));

    // Support different `dateTime` formats by mapping them to a standard
    const buildDateKey = dateTime => moment(dateTime).format(DateUtils.API_DATE_FORMAT_STRING);

    let metrics = config.metrics,
      grain = get(request, 'logicalTable.timeGrain.name') || get(request, 'logicalTable.timeGrain'),
      requestInterval = Interval.parseFromStrings(get(request, 'intervals.0.start'), get(request, 'intervals.0.end'));

    /*
     * Get all date buckets spanned by the data,
     * and group data by date for easier lookup
     */
    let dates = DateUtils.getDatesForInterval(requestInterval, grain),
      byDate = new DataGroup(data, row => buildDateKey(row.dateTime));

    // Make a data point for each date in the request, so c3 can correctly show gaps in the chart
    return dates.map(date => {
      let key = buildDateKey(date),
        rowsForDate = byDate.getDataForKey(key) || [],
        row = rowsForDate[0] || {}; // Metric series expects only one data row for each date

      let x = {
        rawValue: key,
        displayValue: date.format(ChartAxisDateTimeFormats[grain])
      };

      // Build an object consisting of x value and requested metrics
      return Object.assign(
        { x },
        ...metrics.map(metric => {
          let metricDisplayName = get(this, 'metricName').getDisplayName(metric),
            canonicalName = canonicalizeMetric(metric);

          return {
            [metricDisplayName]: getWithDefault(row, canonicalName, null)
          }; // c3 wants `null` for empty data points
        })
      );
    });
  },

  /**
   * @function buildTooltip
   * @returns {Object} layout for tooltip
   */
  buildTooltip() {
    let builder = this;

    return Ember.Mixin.create({
      layout: tooltipLayout,

      /**
       * @property {Object[]} rowData - maps a response row to each series in a tooltip
       */
      rowData: Ember.computed('x', 'tooltipData', function() {
        return get(this, 'tooltipData').map(() => {
          // Get the full data for this combination of x + series
          let dataForSeries = get(builder, 'byXSeries').getDataForKey(get(this, 'x')) || [];
          return dataForSeries[0];
        });
      })
    });
  }
});
