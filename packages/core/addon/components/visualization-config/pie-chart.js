/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/pie-chart
 *    request=request
 *    response=response
 *    options=chartOptions
 *    onUpdateConfig=(action 'onUpdateChartConfig')
 * }}
 */

import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import { dasherize } from '@ember/string';
import { copy } from 'ember-copy';
import layout from '../../templates/components/visualization-config/pie-chart';

export default Component.extend({
  layout,

  /**
   * @property classNames
   */
  classNames: ['pie-chart-config'],

  /**
   * @property {String} typePrefix - prefix for the line chart component
   */
  typePrefix: 'visualization-config/chart-type/',

  /**
   * @property {String} seriesType
   */
  seriesType: computed('options.series.type', function() {
    return dasherize(get(this, 'options.series.type'));
  }),

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
