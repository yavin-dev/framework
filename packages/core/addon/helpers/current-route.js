/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Returns the name of the currently visited route
 */
import { readOnly } from '@ember/object/computed';
import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { observer, computed, get } from '@ember/object';

export default Helper.extend({
  /**
   * @property {Ember.Controller} application
   */
  application: computed(function() {
    return getOwner(this).lookup('controller:application');
  }),

  /**
   * @property {String} currentPath - name of currently visited route
   */
  currentPath: readOnly('application.currentPath'),

  /**
   * @method compute
   * @override
   * @returns {String} name of currently visited route
   */
  compute() {
    return get(this, 'currentPath');
  },

  /**
   * Observer that recomputes the value when current route changes
   * @method pathDidChange
   * @returns {Void}
   */
  pathDidChange: observer('currentPath', function() {
    this.recompute();
  })
});
