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
import { BaseChartBuilder, C3Row, EmptyC3Data } from './base';
import { tracked } from '@glimmer/tracking';
import { MetricSeries } from 'navi-core/models/chart-visualization';
import NaviFactResponse, { ResponseRow } from 'navi-data/models/navi-fact-response';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';

const BLANK_X_VALUE = '';

export default class MetricChartBuilder extends EmberObject implements BaseChartBuilder {
  @tracked byXSeries?: DataGroup<ResponseRow>;

  /**
   * @inheritdoc
   */
  getXValue(row: ResponseRow, _config: MetricSeries['config'], request: RequestFragment): string {
    const { timeGrainColumn } = request;
    if (timeGrainColumn) {
      const colName = timeGrainColumn.canonicalName;
      const date = row[colName];
      assert(`a date for ${colName} should be found, but got: ${date}`, typeof date === 'string');
      return moment(date).format(API_DATE_FORMAT_STRING);
    }
    return BLANK_X_VALUE;
  }

  /**
   * @inheritdoc
   */
  buildData(
    response: NaviFactResponse,
    config: MetricSeries['config'],
    request: RequestFragment
  ): { series: C3Row[]; names: Record<string, string> } {
    assert('response should be a NaviFactResponse instance', response instanceof NaviFactResponse);

    // Group data by x axis value in order to lookup row data when building tooltip
    this.byXSeries = new DataGroup(response.rows, (row: ResponseRow) => this.getXValue(row, config, request));

    const { timeGrain, metricColumns } = request;

    const names = request.metricColumns.reduce((names: Record<string, string>, metric, index) => {
      names[`series.${index}`] = metric.displayName;
      return names;
    }, {});

    if (timeGrain) {
      if (!(request.timeGrainColumn && response.getIntervalForTimeDimension(request.timeGrainColumn))) {
        return EmptyC3Data;
      }

      const timeGrainColumnName = request.timeGrainColumn.canonicalName;
      const interval = response.getIntervalForTimeDimension(request.timeGrainColumn);
      const { timeGrain } = request;
      assert('request should have an interval', interval);
      assert('request should have a timeGrain', timeGrain);

      // Support different `dateTime` formats by mapping them to a standard
      const buildDateKey = (dateTime: MomentInput) => moment(dateTime).format(API_DATE_FORMAT_STRING);

      /*
       * Get all date buckets spanned by the data,
       * and group data by date for easier lookup
       */
      const dates = interval.makeEndExclusiveFor(timeGrain).getDatesForInterval(timeGrain);
      const byDate = new DataGroup(response.rows, (row: ResponseRow) =>
        buildDateKey(row[timeGrainColumnName] as MomentInput)
      );
      // Make a data point for each date in the request, so c3 can correctly show gaps in the chart
      const series: C3Row[] = dates.map(date => {
        const key = buildDateKey(date);
        const rowsForDate = byDate.getDataForKey(key) || [];
        const row = rowsForDate[0] || {}; // Metric series expects only one data row for each date
        const displayValue = date.format(ChartAxisDateTimeFormats[timeGrain]);
        return this.buildC3Row(key, displayValue, row, metricColumns);
      });
      return { series, names };
    }
    const series = [this.buildC3Row(BLANK_X_VALUE, BLANK_X_VALUE, response.rows[0], metricColumns)];
    return { series, names };
  }

  /**
   *  Builds c3 row
   */
  private buildC3Row(
    value: string,
    displayValue: string,
    row: Record<string, unknown>,
    metricColumns: ColumnFragment<'metric'>[]
  ): C3Row {
    // Group the dimension required

    // the data for date used in the C3 chart
    const c3row: C3Row = {
      x: { rawValue: value, displayValue }
    } as C3Row;

    return Object.assign(
      c3row,
      ...metricColumns.map((metric, index) => {
        const metricValue = row[metric.canonicalName];
        return {
          [`series.${index}`]: typeof metricValue === 'number' ? metricValue : null // c3 wants `null` for empty data points
        };
      })
    );
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
