/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { Args as BaseArgs } from './base';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { DateTimeSeries, DimensionSeries, MetricSeries } from 'navi-core/models/chart-visualization';
import { SeriesConfig } from 'navi-core/chart-builders/base';

type MetricSeriesOptions = { seriesType: MetricSeries['type']; seriesConfig: MetricSeries['config'] };
type DimensionSeriesOptions = { seriesType: DimensionSeries['type']; seriesConfig: DimensionSeries['config'] };
type DateTimeSeriesOptions = { seriesType: DateTimeSeries['type']; seriesConfig: DateTimeSeries['config'] };
export type SeriesOptions = MetricSeriesOptions | DimensionSeriesOptions | DateTimeSeriesOptions;
type Args = BaseArgs<SeriesConfig> & SeriesOptions;

export default class NaviVisualizationConfigSeriesChartComponent extends Component<Args> {
  get selectedMetric(): ColumnFragment | undefined {
    if (this.args.seriesType !== 'dimension') {
      return undefined;
    }
    const { metricCid } = this.args.seriesConfig;
    return this.args.request.metricColumns.find(({ cid }) => cid === metricCid);
  }

  /**
   * whether to display the metric select
   */
  get showMetricSelect(): boolean {
    const { request, seriesType } = this.args;
    return seriesType === 'dimension' && request.metricColumns.length > 1;
  }

  @action
  onUpdateChartMetric(metric: ColumnFragment) {
    assert('seriesType should be dimension', this.args.seriesType === 'dimension');
    const newConfig: DimensionSeries['config'] = {
      ...this.args.seriesConfig,
      metricCid: metric.cid,
    };
    this.args.onUpdateConfig(newConfig);
  }
}
