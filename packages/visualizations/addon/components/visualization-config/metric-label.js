/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{visualization-config/metric-label
 *    request=request
 *    response=response
 *    options=options
 *    onUpdateConfig=(action 'onUpdateConfig')
 *  }}
 */
import Component from '@ember/component';
import layout from '../../templates/components/visualization-config/metric-label';

export default Component.extend({
  /**
   * @property {Object} layout
   */
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['metric-label-config'],

  actions: {
    /**
     * @action updateLabel
     */
    updateLabel(description) {
      this.sendAction('onUpdateConfig', { description });
    }
  }
});
