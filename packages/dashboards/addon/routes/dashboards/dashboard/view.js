/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Route.extend({
  /**
   * @property {Ember.Service} dashboardData
   */
  dashboardData: service(),

  /**
   * @property {Service} compression
   */
  compression: service(),

  /**
   * @property {Service} metadataService
   */
  metadataService: service('bard-metadata'),

  /**
   * @property {Service} store
   */
  store: service(),

  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * @private
   * @property {Object} _widgetDataCache - stores most recent widget data
   */
  _widgetDataCache: null,

  /**
   * @override
   * @property {Object} queryParams - any time the filters query params changes, rerun the model hook
   */
  queryParams: {
    filters: {
      refreshModel: true
    }
  },

  /**
   * Adds filters from query params to the dashboard then
   * makes an ajax request to retrieve relevant widgets in the dashboard
   *
   * @override
   * @method model
   * @param {Object} transition
   */
  async model(_, transition) {
    const dashboard = this.modelFor('dashboards.dashboard');
    const filterQueryParams = get(transition, 'queryParams.filters');
    const cachedWidgetData = this.get('_widgetDataCache');

    //Record filters before and after setting from query params
    const originalFilters = dashboard.get('filters').serialize();
    try {
      await this._addFiltersFromQueryParams(dashboard, filterQueryParams);
    } catch (e) {
      get(this, 'naviNotifications').add({
        message: `Error decoding filter query params. Using default dashboard filters.`,
        type: 'danger',
        timeout: 'medium'
      });
    }
    const newFilters = dashboard.get('filters').serialize();

    const originalValuelessFilters = originalFilters.filter(fil => fil.values.length === 0);
    const newValuelessFilters = newFilters.filter(fil => fil.values.length === 0);

    const wasEmptyFilterAdded =
      newValuelessFilters.length === originalValuelessFilters.length + 1 &&
      newFilters.length === originalFilters.length + 1;
    const wasEmptyFilterRemoved =
      newValuelessFilters.length === originalValuelessFilters.length - 1 &&
      newFilters.length === originalFilters.length - 1;

    /**
     * If we just added a new filter (no values yet) or just removed a filter with no values,
     * return the last set of widget data because the requests will not have changed because
     * empty filters are pruned from the request
     */
    if (cachedWidgetData && (wasEmptyFilterAdded || wasEmptyFilterRemoved)) {
      return { dashboard, dataForWidget: cachedWidgetData };
    }
    const dataForWidget = await this.get('dashboardData').fetchDataForDashboard(dashboard);
    this.set('_widgetDataCache', dataForWidget);

    return { dashboard, dataForWidget };
  },

  /**
   * Update Model to have dirty attributes that match the filter query params
   *
   * @private
   * @method addFiltersFromQueryParams
   * @param {Object} dashboard
   * @param {String} filterQueryParams
   */
  async _addFiltersFromQueryParams(dashboard, filterQueryParams) {
    const modelFilters = dashboard.get('filters');

    if (isEmpty(filterQueryParams)) {
      return;
    }

    try {
      const decompressedFilters = await this.get('compression').decompress(filterQueryParams);

      if (!decompressedFilters.hasOwnProperty('filters') || !Array.isArray(decompressedFilters.filters)) {
        throw Error('Filter query params are not valid filters');
      }

      //Remove all filters from the fragment array
      modelFilters.length = 0;

      decompressedFilters.filters.map(fil => {
        const newFragmentFields = {
          field: fil.field,
          operator: fil.operator,
          rawValues: fil.values,
          dimension: this.get('metadataService').getById('dimension', fil.dimension)
        };

        const newFragment = this.store.createFragment('bard-request/fragments/filter', newFragmentFields);
        modelFilters.pushObject(newFragment);
      });
    } catch (e) {
      throw Error(`Error decompressing filter query params: ${filterQueryParams}\n${e}`);
    }
  },

  /**
   * @override
   * @method resetController - reset query params on exit of route
   * @param {Object} controller
   * @param {Boolean} isExiting
   */
  deactivate() {
    this._super(...arguments);

    this.get('controller').set('filters', null);
    this.set('_widgetDataCache', null);
    this.modelFor(this.routeName).dashboard.rollbackAttributes();
  }
});
