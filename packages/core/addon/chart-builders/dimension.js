/**
 * Copyright 2018, Yahoo Holdings Inc.
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
import EmberObject, { set, computed } from '@ember/object';
import moment from 'moment';
import DataGroup from 'navi-core/utils/classes/data-group';
import Interval from 'navi-data/utils/classes/interval';
import DateUtils from 'navi-data/utils/date';
import tooltipLayout from '../templates/chart-tooltips/dimension';
import ChartAxisDateTimeFormats from 'navi-core/utils/chart-axis-date-time-formats';
import { groupDataByDimensions, buildSeriesKey, getSeriesName } from 'navi-core/utils/chart-data';
import { canonicalizeMetric } from 'navi-data/utils/metric';

export default EmberObject.extend({
  /**
   * @method getSeriesName
   * @param {Object} row - single row of fact data
   * @param {Object} config - series config
   * @param {Object} request - request used to query fact data
   * @returns {String} name of series given row belongs to
   */
  getSeriesName: (row, config /*, request */) => {
    let dimensionOrder = config.dimensionOrder;

    return dimensionOrder.map(dim => row[`${dim}|id`]).join(',');
  },

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
   * @param {Array} config.dimensions - list of dimensions to chart
   * @param {Object} request - request used to get data
   * @returns {Array} array of c3 data with x values
   */
  buildData(data, config, request) {
    // Group data by x axis value + series name in order to lookup trends when building tooltip
    set(
      this,
      'byXSeries',
      new DataGroup(data, row => {
        let seriesName = this.getSeriesName(row, config, request),
          x = this.getXValue(row);

        return x + seriesName;
      })
    );

    // Support different `dateTime` formats by mapping them to a standard
    const buildDateKey = dateTime => moment(dateTime).format(DateUtils.API_DATE_FORMAT_STRING);

    let metric = config.metric, // Metric used for the series
      seriesKey = buildSeriesKey(config), // Build the series required
      seriesName = getSeriesName(config), // Get all the series names
      byDate = new DataGroup(data, row => buildDateKey(row.dateTime)), // Group by dates for easier lookup
      grain = request.logicalTable.timeGrain,
      requestInterval = Interval.parseFromStrings(request.intervals?.[0]?.start, request.intervals?.[0]?.end);

    // For each unique date, build the series
    return DateUtils.getDatesForInterval(requestInterval, grain).map(date => {
      let key = buildDateKey(date),
        x = {
          rawValue: key,
          displayValue: moment(date).format(ChartAxisDateTimeFormats[grain])
        };

      // Pulling the specific data rows for the date
      let dateRows = byDate.getDataForKey(key) || [];

      // Group the dimension required
      let byDim = groupDataByDimensions(dateRows, config);

      // the data for date used in the C3 chart
      let dataForDate = { x };

      // Adding the series to the keys
      seriesKey.forEach((s, index) => {
        //Handling the case when some of the data group does not exist
        if (byDim.getDataForKey(s) && byDim.getDataForKey(s).length) {
          // Extending the data for date with the grouped dimension and metric value
          Object.assign(dataForDate, {
            [seriesName[index]]: byDim.getDataForKey(s)[0][canonicalizeMetric(metric)]
          });
        } else {
          // Returning null for the chart to show missing data
          Object.assign(dataForDate, { [seriesName[index]]: null });
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
      return dataForDate;
    });
  },

  /**
   * @function buildTooltip
   * @returns {Object} layout for tooltip
   */
  buildTooltip() {
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
          let dataForSeries = builder.byXSeries.getDataForKey(this.x + series.id) || [];

          return dataForSeries[0];
        });
      })
    });
  }
});
