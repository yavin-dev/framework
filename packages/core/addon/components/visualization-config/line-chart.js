/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/line-chart
 *    request=request
 *    response=response
 *    options=chartOptions
 *    onUpdateConfig=(action 'onUpdateChartConfig')
 * }}
 */

import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { dasherize } from '@ember/string';
import { copy } from 'ember-copy';
import layout from '../../templates/components/visualization-config/line-chart';
import { featureFlag } from 'navi-core/helpers/feature-flag';

export default Component.extend({
  layout,

  init() {
    this._super(...arguments);
    this.curveOptions = ['line', 'spline', 'step'];
  },

  /**
   * @property classNames
   */
  classNames: ['line-chart-config'],

  /**
   * @property {String} typePrefix - prefix for the line chart component
   */
  typePrefix: 'visualization-config/chart-type/',

  /**
   * @property {Boolean} showStackOption - whether to display the `stacked` toggle
   */
  showStackOption: computed('type', 'request', function() {
    if (!featureFlag('enableChartStacking')) {
      return false;
    }

    const { type, request } = this,
      visualizationManifest = getOwner(this).lookup(`manifest:${type}`);

    return visualizationManifest.hasGroupBy(request) || visualizationManifest.hasMultipleMetrics(request);
  }),

  /**
   * @property {Object} seriesConfig
   */
  seriesConfig: computed('options', function() {
    return get(this, 'options.axis.y.series.config');
  }),

  /**
   * @property {String} seriesType
   */
  seriesType: computed('options', function() {
    return dasherize(get(this, 'options.axis.y.series.type'));
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
      set(newOptions, 'axis.y.series.config', seriesConfig);
      this.onUpdateConfig(newOptions);
    },

    /**
     * Updates line chart style
     *
     * @method onUpdateStyle
     * @param {String} field - which setting is getting updated, currently `curve` and `area`
     * @param {String|Boolean} - value to update the setting with.
     */
    onUpdateStyle(field, value) {
      const options = get(this, 'options');
      let newOptions = copy(options);
      set(newOptions, 'style', Object.assign({}, newOptions.style, { [field]: value }));
      this.onUpdateConfig(newOptions);
    }
  }
});
