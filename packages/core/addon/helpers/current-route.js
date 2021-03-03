/* eslint-disable ember/no-observers */
/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Returns the name of the currently visited route
 */
import { readOnly } from '@ember/object/computed';
import Helper from '@ember/component/helper';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';

export default Helper.extend({
  /**
   * @service router
   */
  router: service(),

  /**
   * @property {String} currentPath - name of currently visited route
   */
  currentPath: readOnly('router.currentRouteName'),

  /**
   * @method compute
   * @override
   * @returns {String} name of currently visited route
   */
  compute() {
    return this.currentPath;
  },

  /**
   * Observer that recomputes the value when current route changes
   * @method pathDidChange
   * @returns {Void}
   */
  pathDidChange: observer('currentPath', function () {
    this.recompute();
  }),
});
