/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{navi-visualization-config/metric-label
 *    request=request
 *    response=response
 *    options=options
 *    onUpdateConfig=(action 'onUpdateConfig')
 *  }}
 */
import Component from '@ember/component';
import layout from '../../templates/components/navi-visualization-config/metric-label';
import { get } from '@ember/object';

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
      const handleUpdateConfig = get(this, 'onUpdateConfig');

      if (handleUpdateConfig) handleUpdateConfig({ description });
    },

    /**
     * @action updateFormat
     */
    updateFormat(format) {
      const handleUpdateConfig = get(this, 'onUpdateConfig');

      if (handleUpdateConfig) handleUpdateConfig({ format });
    }
  }
});
