/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { featureFlag } from 'navi-core/helpers/feature-flag';

export default Route.extend({
  /**
   * @property {Ember.Service} dashboardData
   */
  dashboardData: service(),

  /**
   * @override
   * @method init - set hasEntered to false until we've setup the controller
   */
  init() {
    this._super(...arguments);
    this.set('hasEntered', false);
  },

  /**
   * Makes an ajax request to retrieve relevant widgets in the dashboard
   *
   * @override
   * @method model
   */
  async model() {
    const dashboard = this.modelFor('dashboards.dashboard');
    const dataForWidget = await this.get('dashboardData').fetchDataForDashboard(dashboard);

    return { dashboard, dataForWidget };
  },

  /**
   * @override
   * @method resetController - reset query params on exit of route
   * @param {Object} controller
   * @param {Boolean} isExiting
   */
  resetController(controller, isExiting /*transition*/) {
    this._super(...arguments);

    if (isExiting) {
      //Reset hasEntered state to false as we exit the route
      this.set('hasEntered', false);
      controller.resetModel();
    }
  },

  /**
   * @override
   * @method setupController - set model in controller and add filters to model from query params
   */
  async setupController(controller, model) {
    this._super(...arguments);

    //Add filters from query params on route entry only and after model and query params are set in controller
    if (!this.get('hasEntered') && !model.dashboard.hasDirtyAttributes) {
      //Make sure this only gets run on initial route entry
      this.set('hasEntered', true);

      if (featureFlag('enableDashboardFilters') && featureFlag('enableDashboardFilterQueryParams')) {
        await this.controllerFor('dashboards/dashboard/view').addFiltersFromQueryParams();
      }
    }
  }
});
