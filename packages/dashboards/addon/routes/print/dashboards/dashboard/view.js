/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * @property {Ember.Service} dashboardData
   */
  dashboardData: service(),
  /**
   * Makes an ajax request to retrieve relevant widgets in the dashboard
   *
   * @method model
   * @override
   */
  model() {
    let dashboard = this.modelFor('print.dashboards.dashboard');
    return this.get('dashboardData')
      .fetchDataForDashboard(dashboard)
      .then(dataForWidget => {
        return { dashboard, dataForWidget };
      });
  }
});
