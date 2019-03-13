/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base Class for child components
 */
import { camelize } from '@ember/string';
import { assert } from '@ember/debug';
import { computed } from '@ember/object';
import Component from '@ember/component';
import Layout from '../templates/components/pick-inner-component';

export default Component.extend({
  layout: Layout,

  /**
   * This property must be set when extending this component.
   * @property {String} componentName - name used when registering with parent container
   */
  componentName: computed(function() {
    assert('componentName property must be defined');
  }),

  /**
   * @method init - sets action target to parent container
   * @override
   */
  init() {
    this._super(...arguments);

    this._updateTarget();
  },

  /**
   * @method _updateTarget - sets action target to parent container and registers with parent
   * @private
   */
  _updateTarget() {
    let targetContainer = this.nearestWithProperty('pickActionHandler');

    assert(`${this.get('componentName')} component can only be used from within a pick-container`, targetContainer);

    this.set('target', targetContainer);

    // Register with target
    targetContainer.register(camelize(this.get('componentName')), this);
  }
});
