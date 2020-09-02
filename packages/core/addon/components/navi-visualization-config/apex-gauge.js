/**
 * Copyright 2020, Yahoo Holdings Inc. Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * Usage:
 * <NaviVisualizationConfig::ApexGauge
 *   @request=request
 *   @response=response
 *   @options=tableOptions
 * />
 */
import Component from '@glimmer/component';
import { set, action } from '@ember/object';
import { copy } from 'ember-copy';

class NaviVisualizationConfigApexGaugeComponent extends Component {
  /**
   * Updates the baseline value of the apex-gauge chart
   * @method onUpdateChartBaseline
   */
  @action
  updateChart(aspect, value) {
    const newOptions = copy(this.args.options);
    set(newOptions, 'series.config.' + aspect, value);
    this.args.onUpdateConfig(newOptions);
  }
}

export default NaviVisualizationConfigApexGaugeComponent;
