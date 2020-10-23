/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviVisualizationConfigBaseComponent from './base';
import { set, action } from '@ember/object';
import { PieChartOptions } from '../navi-visualizations/pie-chart';
import { ChartSeries } from 'navi-core/models/chart-visualization';
import { cloneDeep } from 'lodash-es';

export default class NaviVisualizationConfigPieChartComponent extends NaviVisualizationConfigBaseComponent<
  PieChartOptions
> {
  /**
   * Method to replace the seriesConfig in visualization config object.
   */
  @action
  onUpdateSeriesConfig(seriesConfig: ChartSeries['config']) {
    const newOptions = cloneDeep(this.args.options);
    set(newOptions.series, 'config', seriesConfig);
    this.args.onUpdateConfig(newOptions);
  }
}
