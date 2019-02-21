/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{visualization-config/goal-gauge
 *    request=request
 *    response=response
 *    options=options
 *  }}
 */
import { alias } from '@ember/object/computed';

import Component from '@ember/component';
import layout from '../../templates/components/visualization-config/goal-gauge';
import { computed, get } from '@ember/object';

export default Component.extend({
  /**
   * @property {Object} layout
   */
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['goal-gauge-config'],

  /**
   * @property {object} metric fragment
   */
  metricModel: alias('request.metrics.firstObject'),

  actions: {
    /**
     * @action updateConfig
     */
    updateConfig(type, value) {
      const handleUpdateConfig = get(this, 'onUpdateConfig');

      if (handleUpdateConfig) handleUpdateConfig({ [type]: value });
    }
  }
});
