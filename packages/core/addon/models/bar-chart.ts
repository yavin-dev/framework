/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import LineChart from './line-chart';
import { attr } from '@ember-data/model';
import { ChartConfig } from './chart-visualization';
import type { TypedVisualizationFragment } from './visualization';

export type BarChartConfig = ChartConfig<'bar-chart'>;

export default class BarChart extends LineChart<'bar-chart'> implements BarChartConfig, TypedVisualizationFragment {
  @attr('string', { defaultValue: 'bar-chart' })
  type!: 'bar-chart';

  namespace = 'c3';
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'bar-chart': BarChart;
  }
}
