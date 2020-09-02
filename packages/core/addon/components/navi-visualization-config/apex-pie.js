/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviVisualizationConfig::ApexPie
 *   @request=request
 *   @response=response
 *   @options=tableOptions
 * />
 */
import Component from '@glimmer/component';
import { set, action } from '@ember/object';
import { copy } from 'ember-copy';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class NaviVisualizationConfigApexPieComponent extends Component {
  /**
   * Method to update the config of the chart
   * @method updateLegendVisible
   * @param {string} type - the field of the config being updated
   * @param {boolean} value - the new value of the field being updated
   */
  @action
  updateChart(type, value) {
    const newOptions = copy(this.args.options);
    set(newOptions, 'series.config.' + type, value);
    this.args.onUpdateConfig(newOptions);
  }
}
