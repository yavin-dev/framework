/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{navi-visualization-config/pie-chart
 *    request=request
 *    response=response
 *    options=chartOptions
 *    onUpdateConfig=(action 'onUpdateChartConfig')
 * }}
 */

import Component from '@ember/component';
import { set, action } from '@ember/object';
import { copy } from 'ember-copy';
import layout from '../../templates/components/navi-visualization-config/pie-chart';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class NaviVisualizationConfigPieChartComponent extends Component {
  /**
   * Method to replace the seriesConfig in visualization config object.
   *
   * @method onUpdateConfig
   * @param {Object} seriesConfig
   */
  @action
  onUpdateSeriesConfig(seriesConfig) {
    const { options } = this;
    let newOptions = copy(options);
    set(newOptions, 'series.config', seriesConfig);
    this.onUpdateConfig(newOptions);
  }
}

export default NaviVisualizationConfigPieChartComponent;
