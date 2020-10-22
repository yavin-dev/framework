/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{navi-visualization-config/pie-chart
 *    request=request
 *    response=response
 *    options=chartOptions
 *    onUpdateConfig=(action 'onUpdateChartConfig')
 * }}
 */

import Component from '@glimmer/component';
import { set, action } from '@ember/object';
//@ts-ignore
import { copy } from 'ember-copy';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { ResponseV1 } from 'navi-data/addon/serializers/facts/interface';

type Args = {
  request: RequestFragment;
  response: ResponseV1;
  options: TODO;
  onUpdateConfig: (newOptions: TODO) => void;
};

export default class NaviVisualizationConfigPieChartComponent extends Component<Args> {
  /**
   * Method to replace the seriesConfig in visualization config object.
   *
   * @method onUpdateConfig
   * @param {Object} seriesConfig
   */
  @action
  onUpdateSeriesConfig(seriesConfig: TODO) {
    const newOptions = copy(this.args.options);
    set(newOptions, 'series.config', seriesConfig);
    this.args.onUpdateConfig(newOptions);
  }
}
