/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Logic for grouping chart data by many metrics
 *
 * Usage:
 *   series: {
 *     type: 'metric'
 *     config: {}
 *   }
 */
import Mixin from '@ember/object/mixin';
import { assert } from '@ember/debug';
import moment, { MomentInput } from 'moment';
//@ts-ignore
import tooltipLayout from '../templates/chart-tooltips/metric';
import ChartAxisDateTimeFormats from 'navi-core/utils/chart-axis-date-time-formats';
import DataGroup from 'navi-core/utils/classes/data-group';
import { API_DATE_FORMAT_STRING } from 'navi-data/utils/date';
import EmberObject, { computed } from '@ember/object';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { BaseChartBuilder, C3Row } from './base';
import { tracked } from '@glimmer/tracking';
import { MetricSeries } from 'navi-core/models/chart-visualization';
import NaviFactResponse, { ResponseRow } from 'navi-data/models/navi-fact-response';

export default class MetricChartBuilder extends EmberObject implements BaseChartBuilder {
  @tracked byXSeries?: DataGroup<ResponseRow>;

  /**
   * @inheritdoc
   */
  getXValue(row: ResponseRow, _config: MetricSeries['config'], request: RequestFragment): string {
    const name = request.timeGrainColumn.canonicalName;
    const date = row[name];
    assert(`a date for ${name} should be found, but got ${date}`, typeof date === 'string');
    return moment(date).format(API_DATE_FORMAT_STRING);
  }

  /**
   * @inheritdoc
   */
  buildData(response: NaviFactResponse, config: MetricSeries['config'], request: RequestFragment): C3Row[] {
    assert('response should be a NaviFactResponse instance', response instanceof NaviFactResponse);
    const timeGrainColumn = request.timeGrainColumn.canonicalName;
    const interval = response.getIntervalForTimeDimension(request.timeGrainColumn);
    const { timeGrain } = request;
    assert('request should have an interval', interval);
    assert('request should have a timeGrain', timeGrain);
    // Group data by x axis value in order to lookup row data when building tooltip
    this.byXSeries = new DataGroup(response.rows, (row: ResponseRow) => this.getXValue(row, config, request));

    // Support different `dateTime` formats by mapping them to a standard
    const buildDateKey = (dateTime: MomentInput) => moment(dateTime).format(API_DATE_FORMAT_STRING);

    /*
     * Get all date buckets spanned by the data,
     * and group data by date for easier lookup
     */
    const dates = interval.makeEndExclusiveFor(timeGrain).getDatesForInterval(timeGrain);
    const byDate = new DataGroup(response.rows, (row: ResponseRow) =>
      buildDateKey(row[timeGrainColumn] as MomentInput)
    );

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
   * @inheritdoc
   */
  buildTooltip(_config: MetricSeries['config'], _request: RequestFragment) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let builder = this;

    // eslint-disable-next-line ember/no-new-mixins
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
