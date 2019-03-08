/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@ember/component';

import { warn } from '@ember/debug';
import { computed, get } from '@ember/object';

export default Component.extend({
  /**
   * @property {DS.Model} report - custom report
   */
  report: undefined,

  /**
   * @property {Boolean} checkPermission - if true permission check is performed
   */
  checkPermission: false,

  /**
   * @property {Array} classNames
   */
  classNames: ['report-control'],

  /**
   * @property {Array} classNameBindings
   */
  classNameBindings: ['actionDisabled:disabled'],

  /**
   * @override
   * @method init
   */
  init() {
    this._super(...arguments);
    warn('report should be of type report', get(this, 'report.constructor.modelName') === 'report', {
      id: 'navi-report-actions.base-action'
    });
  },

  /**
   * @property {Boolean} - actionDisabled
   */
  actionDisabled: computed('checkPermission', 'report.isOwner', 'report.isNew', function() {
    if (get(this, 'report.isNew')) {
      return true;
    }

    if (get(this, 'checkPermission')) {
      return !get(this, 'report.isOwner');
    }

    return false;
  })
});
