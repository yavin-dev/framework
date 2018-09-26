/**
 * Copyright 2018, Yahoo Holdings Inc.
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
import Ember from 'ember';
import moment from 'moment';
import tooltipLayout from '../templates/chart-tooltips/date';
import DataGroup from 'navi-core/utils/classes/data-group';
import { get, set, getWithDefault } from '@ember/object';
import { canonicalizeMetric } from 'navi-data/utils/metric';

const API_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

/**
 * @constant {Object} logic for grouping one time grain by another
 * TODO support more combinations
 */
export const GROUP = {
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
        getXValue: dateTime => dateTime.second() + 1,
        getXDisplay: x => 'Second ' + x,
        getSeries: dateTime => dateTime.format('MMM D HH:mm')
      }
    }
  },
  minute: {
    by: {
      hour: {
        xValueCount: 60,
        getXValue: dateTime => dateTime.minute() + 1,
        getXDisplay: x => 'Minute ' + x,
        getSeries: dateTime => dateTime.format('MMM D HH:00')
      }
    }
  },
  hour: {
    by: {
      day: {
        xValueCount: 24,
        getXValue: dateTime => dateTime.hour() + 1,
        getXDisplay: x => 'Hour ' + x,
        getSeries: dateTime => dateTime.format('MMM D')
      }
    }
  },
  day: {
    by: {
      month: {
        xValueCount: 31,
        getXValue: dateTime => dateTime.date(),
        getXDisplay: x => 'Day ' + x,
        getSeries: dateTime => dateTime.format('MMM YYYY')
      },
      year: {
        xValueCount: 366,
        getXValue: dateTime => dateTime.dayOfYear(),
        getXDisplay: x => 'Day ' + x,
        getSeries: dateTime => dateTime.format('YYYY')
      }
    }
  },
  week: {
    by: {
      year: {
        xValueCount: 53,
        getXValue: dateTime => dateTime.isoWeek(),
        getXDisplay: x =>
          moment()
            .isoWeek(x)
            .format('MMM'),
        getSeries: dateTime => dateTime.format('GGGG')
      }
    }
  },
  month: {
    by: {
      year: {
        xValueCount: 12,
        getXValue: dateTime => dateTime.month() + 1,
        getXDisplay: x =>
          moment()
            .month(x - 1)
            .format('MMM'),
        getSeries: dateTime => dateTime.format('YYYY')
      }
    }
  }
};

/**
 * Group data by series, then x value, in order to easily build c3's json format
 *
 * @function _groupDataBySeries
 * @param {Array} data - rows of chart data to group
 * @param {String} metric - metric name
 * @param {Object} grouper - series grouping logic
 * @returns {Object} metric value grouped by series and x value
 */
const _groupDataBySeries = (data, metric, grouper) => {
  return data.reduce((map, row) => {
    let dateTime = moment(get(row, 'dateTime'), API_DATE_FORMAT),
      series = grouper.getSeries(dateTime),
      x = grouper.getXValue(dateTime);

    if (!map[series]) {
      map[series] = {};
    }

    map[series][x] = get(row, metric);

    return map;
  }, {});
};

/**
 * Convert seriesMap to data rows
 *
 * @function _buildDataRows
 * @param {Object} seriesMap - data index by series and x value
 * @param {Object} grouper - series grouping logic
 * @returns {Array} array of c3 data with x values
 */
const _buildDataRows = (seriesMap, grouper) => {
  let _buildRow = x => {
    let row = {
      x: {
        rawValue: x,
        displayValue: grouper.getXDisplay(x)
      }
    };

    // Add each series to the row
    Object.keys(seriesMap).forEach(
      series => (row[series] = getWithDefault(seriesMap[series], x.toString(), null)) // c3 wants `null` for empty data points
    );

    return row;
  };

  let rows = [];
  for (let x = 1; x <= grouper.xValueCount; x++) {
    rows.push(_buildRow(x));
  }

  return rows;
};

/**
 * Gets the grouper for a given config and request
 *
 * @function _getGrouper
 * @param {Object} request - request used to query fact data
 * @param {Object} config - series config
 * @returns {Object} grouper for request and config
 */
const _getGrouper = (request, config) => {
  let timeGrain = get(request, 'logicalTable.timeGrain'),
    seriesTimeGrain = get(config, 'timeGrain');

  return GROUP[timeGrain].by[seriesTimeGrain];
};

export default Ember.Object.extend({
  /**
   * @method getSeriesName
   * @param {Object} row - single row of fact data
   * @param {Object} config - series config
   * @param {Object} request - request used to query fact data
   * @returns {String} name of series given row belongs to
   */
  getSeriesName(row, config, request) {
    let grouper = _getGrouper(request, config);

    return grouper.getSeries(moment(row.dateTime));
  },

  /**
   * @method getXValue
   * @param {Object} row - single row of fact data
   * @param {Object} config - series config
   * @param {Object} request - request used to query fact data
   * @returns {String} name of x value given row belongs to
   */
  getXValue(row, config, request) {
    let grouper = _getGrouper(request, config);

    return grouper.getXValue(moment(row.dateTime));
  },

  /**
   * @function buildData
   * @param {Object} data - rows of chart data to group
   * @param {Object} config
   * @param {String} config.timeGrain - unit of time each series will span
   * @param {String} config.metric - metric to chart
   * @param {Object} request - request used to get data
   * @returns {Array} array of c3 data with x values
   */
  buildData(data, config, request) {
    // Group data by x axis value + series name in order to lookup metric attributes when building tooltip
    set(
      this,
      'byXSeries',
      new DataGroup(data, row => {
        let seriesName = this.getSeriesName(row, config, request),
          x = this.getXValue(row, config, request);

        return x + seriesName;
      })
    );

    let { timeGrain: seriesTimeGrain, metric } = config,
      requestTimeGrain = get(request, 'logicalTable.timeGrain'),
      grouper = GROUP[requestTimeGrain].by[seriesTimeGrain],
      canonicalName = canonicalizeMetric(metric);

    let seriesMap = _groupDataBySeries(data, canonicalName, grouper);
    return _buildDataRows(seriesMap, grouper);
  },

  /**
   * @function buildTooltip
   * @param {Object} config
   * @returns {Object} object with tooltip template and rendering context
   */
  buildTooltip() {
    let builder = this;

    return Ember.Mixin.create({
      layout: tooltipLayout,

      /**
       * @property {Object[]} rowData - maps a response row to each series in a tooltip
       */
      rowData: Ember.computed('x', 'tooltipData', function() {
        return get(this, 'tooltipData').map(series => {
          // Get the full data for this combination of x + series
          let dataForSeries = get(builder, 'byXSeries').getDataForKey(get(this, 'x') + series.name) || [];

          return dataForSeries[0];
        });
      })
    });
  }
});
