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
import { getRequestDimensions, groupDataByDimensions } from 'navi-core/utils/chart-data';
import { BaseChartBuilder, C3Row, ResponseRow } from './base';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import { tracked } from '@glimmer/tracking';
import { DimensionSeries } from 'navi-core/models/line-chart';

export default class DimensionChartBuilder extends EmberObject implements BaseChartBuilder {
  @tracked byXSeries?: DataGroup<ResponseRow>;

  /**
   * @param row - single row of fact data
   * @param config - series config
   * @param request - request used to query fact data
   * @returns name of series given row belongs to
   */
  getSeriesName(row: ResponseRow, _config: DimensionSeries['config'], request: RequestFragment): string {
    return request.dimensionColumns.map(dim => row[dim.canonicalName]).join(',');
  }

  /**
   * @inheritdoc
   */
  getXValue(row: ResponseRow, _config: DimensionSeries['config'], request: RequestFragment): string {
    // expects timeGrainColumn values to be a readable moment input
    const date = row[request.timeGrainColumn.canonicalName] as MomentInput;
    return moment(date).format(API_DATE_FORMAT_STRING);
  }

  /**
   * @inheritdoc
   */
  buildData(response: ResponseV1, config: DimensionSeries['config'], request: RequestFragment): C3Row[] {
    const timeGrainColumn = request.timeGrainColumn.canonicalName;
    const { timeGrain, interval } = request;
    assert('request should have an interval', interval);
    assert('request should have a timeGrain', timeGrain);
    // Group data by x axis value + series name in order to lookup trends when building tooltip
    this.byXSeries = new DataGroup(response.rows, row => {
      return `${this.getXValue(row, config, request)} ${this.getSeriesName(row, config, request)}`;
    });

    const buildDateKey = (dateTime: MomentInput) => moment(dateTime).format(API_DATE_FORMAT_STRING);

    const { metricCid } = config;
    const metric = request.columns.find(({ cid }) => cid === metricCid);
    assert(`a metric with cid ${metricCid} should be found`, metric);
    const dimensions = getRequestDimensions(request);
    const seriesKey = config.dimensions.map(s => dimensions.map(d => s.values[d.cid]).join('|')); // Build the series required
    const seriesName = config.dimensions.map(s => s.name); // Get all the series names
    const byDate = new DataGroup(response.rows, row => buildDateKey(row[timeGrainColumn] as string)); // Group by dates for easier lookup

    // For each unique date, build the series
    return interval.getDatesForInterval(timeGrain).map(date => {
      const key = buildDateKey(date);

      // Pulling the specific data rows for the date
      let dateRows = byDate.getDataForKey(key) || [];

      // Group the dimension required
      let byDim = groupDataByDimensions(dateRows, dimensions);

      // the data for date used in the C3 chart
      let dataForDate: C3Row = {
        x: { rawValue: key, displayValue: moment(date).format(ChartAxisDateTimeFormats[timeGrain]) }
      } as C3Row;

      // Adding the series to the keys
      seriesKey.forEach((s, index) => {
        //Handling the case when some of the data group does not exist
        if (byDim.getDataForKey(s) && byDim.getDataForKey(s).length) {
          // Extending the data for date with the grouped dimension and metric value
          Object.assign(dataForDate, {
            [seriesName[index]]: byDim.getDataForKey(s)[0][metric.canonicalName]
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
  }

  /**
   * @inheritdoc
   */
  buildTooltip(_config: DimensionSeries['config'], _request: RequestFragment) {
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
        return this.tooltipData.map((series: any) => {
          // Get the full data for this combination of x + series
          let dataForSeries = builder.byXSeries?.getDataForKey(this.x + series.id) || [];

          return dataForSeries[0];
        });
      })
    });
  }
}
