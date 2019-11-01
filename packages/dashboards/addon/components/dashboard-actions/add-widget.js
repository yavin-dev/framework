/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#dashboard-actions/add-widget
 *      reports=reports
 *      dashboard=dashboard
 *      onSelectReport=(action "onSelectReport")
 *   }}
 *      Inner template
 *   {{/dashboard-actions/add-widget}}
 */

import { oneWay } from '@ember/object/computed';
import { A } from '@ember/array';
import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import layout from '../../templates/components/dashboard-actions/add-widget';

export default Component.extend({
  layout,

  /**
   * @property {Object} dashboard - dashboard to create new widgets under
   */
  dashboard: undefined,

  /**
   * @property {Boolean} showModal
   */
  showModal: false,

  /**
   * @property {Object} selectedReport - selectedReport defaults to `new report`
   */
  selectedReport: oneWay('reportsWithCreate.firstObject'),

  /**
   * @property {Array} reportsWithCreate - users reports with create new as the first object
   */
  reportsWithCreate: computed('reports', function() {
    let newReport = {
        id: 'new',
        title: 'Create new...'
      },
      reports = get(this, 'reports');

    return A([
      newReport,
      {
        groupName: 'My Reports',
        options: reports.toArray() // Options must be a native array - https://github.com/cibernox/ember-power-select/issues/719
      }
    ]);
  }),

  /**
   * @action click
   */
  click() {
    set(this, 'showModal', true);
  }
});
