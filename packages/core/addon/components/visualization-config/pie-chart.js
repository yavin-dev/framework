/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/pie-chart
 *    request=request
 *    response=response
 *    options=chartOptions
 *    type=type
 *    onUpdateConfig=(action 'onUpdateChartConfig')
 * }}
 */

import Component from '@ember/component';
import layout from '../../templates/components/visualization-config/pie-chart';
import { set, get } from '@ember/object';
import { copy } from 'ember-copy';

export default Component.extend({
  layout,

  /**
   * @property classNames
   */
  classNames: ['pie-chart-config'],

  actions: {
    /**
     * Method to replace the seriesConfig in visualization config object.
     *
     * @method onUpdateConfig
     * @param {Object} seriesConfig
     */
    onUpdateConfig(seriesConfig) {
      let newOptions = copy(get(this, 'options'));
      set(newOptions, 'series.config', seriesConfig);
      this.onUpdateConfig(newOptions);
    }
  }
});
