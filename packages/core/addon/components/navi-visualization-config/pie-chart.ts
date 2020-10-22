/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { set, action } from '@ember/object';
//@ts-ignore
import { copy } from 'ember-copy';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { ResponseV1 } from 'navi-data/addon/serializers/facts/interface';
import { PieChartOptions } from '../navi-visualizations/pie-chart';
import { ChartSeries } from 'navi-core/models/chart-visualization';

type Args = {
  request: RequestFragment;
  response: ResponseV1;
  options: PieChartOptions;
  onUpdateConfig: (newOptions: PieChartOptions) => void;
};

export default class NaviVisualizationConfigPieChartComponent extends Component<Args> {
  /**
   * Method to replace the seriesConfig in visualization config object.
   *
   * @method onUpdateConfig
   * @param seriesConfig
   */
  @action
  onUpdateSeriesConfig(seriesConfig: ChartSeries['config']) {
    const newOptions = copy(this.args.options);
    set(newOptions, 'series.config', seriesConfig);
    this.args.onUpdateConfig(newOptions);
  }
}
