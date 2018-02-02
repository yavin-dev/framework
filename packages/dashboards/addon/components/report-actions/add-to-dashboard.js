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
import Ember from 'ember';
import layout from '../../templates/components/report-actions/add-to-dashboard';

const { computed, get, set } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Boolean} showModal
   */
  showModal: false,

  /**
   * @property {Service} userService
   */
  userService: Ember.inject.service('user'),

  /**
   * @property {Array} groupedDashboards
   */
  groupedDashboards: computed('dashboards', function(){
    return Ember.A([
      {
        groupName: 'My Dashboards',
        options: get(this, 'dashboards').toArray()
      }
    ]);
  }),

  /**
   * @property {String} reportName - report name
   */
  reportName: computed.oneWay('report.title'),

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
