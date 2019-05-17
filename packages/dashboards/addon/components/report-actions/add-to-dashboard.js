/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#report-actions/add-to-dashboard
 *      report=report
 *      dashboards=dashboards
 *      onAddToDashboard=(action 'addToExisting')
 *      onAddToNewDashboard=(action 'addToNew')
 *   }}
 *      Inner template
 *   {{/report-actions/add-to-dashboard}}
 */
import { oneWay } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import layout from '../../templates/components/report-actions/add-to-dashboard';

export default Component.extend({
  layout,

  /**
   * @property {Boolean} showModal
   */
  showModal: false,

  /**
   * @property {Service} userService
   */
  userService: service('user'),

  /**
   * @property {Array} groupedDashboards
   */
  groupedDashboards: computed('dashboards', function() {
    return A([
      {
        groupName: 'My Dashboards',
        options: get(this, 'dashboards').toArray()
      }
    ]);
  }),

  /**
   * @property {String} reportName - report name
   */
  reportName: oneWay('report.title'),

  /**
   * @property {Boolean} shouldCreateDashboard - true if user wants to create a new dashboard
   */
  shouldCreateDashboard: false,

  /**
   * @property {Boolean} disableAdd - disable addToDashboard button
   */
  disableAdd: computed('selectedDashboard', 'newDashboardTitle', function() {
    return !(get(this, 'selectedDashboard') || get(this, 'newDashboardTitle'));
  }),

  /**
   * @method click
   */
  click() {
    set(this, 'showModal', true);
  }
});
