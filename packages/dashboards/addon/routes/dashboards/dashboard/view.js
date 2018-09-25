/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';

export default Ember.Route.extend({
  /**
   * @property {Ember.Service} dashboardData
   */
  dashboardData: Ember.inject.service(),

  /**
   * Makes an ajax request to retrieve relevant widgets in the dashboard
   *
   * @method model
   * @override
   */
  model() {
    let dashboard = this.modelFor('dashboards.dashboard');
    return this.get('dashboardData')
      .fetchDataForDashboard(dashboard)
      .then(dataForWidget => {
        return { dashboard, dataForWidget };
      });
  }
});
