/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{visualization-config/goal-gauge
 *    request=request
 *    response=response
 *    options=options
 *  }}
 */
import Ember from 'ember';
import layout from '../../templates/components/visualization-config/goal-gauge';

export default Ember.Component.extend({
  /**
   * @property {Object} layout
   */
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['goal-gauge-config'],

  actions: {
    /**
     * @action updateConfig
     */
    updateConfig(type, value) {
      this.sendAction('onUpdateConfig', { [type]: value });
    },
  }
});
