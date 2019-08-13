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
   * @private
   * @property {Object} _widgetDataCache - stores most recent widget data
   */
  _widgetDataCache: null,

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

    const originalFilters = dashboard.get('filters').serialize();
    await this._addFiltersFromQueryParams(dashboard, filterQueryParams);
    const newFilters = dashboard.get('filters').serialize();

    if (
      cachedWidgetData &&
      newFilters.length === originalFilters.length + 1 &&
      newFilters.any(fil => fil.values.length === 0)
    ) {
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

    let decompressedFilters = null;
    try {
      decompressedFilters = await this.get('compression').decompress(filterQueryParams);

      if (!decompressedFilters.hasOwnProperty('filters') || !Array.isArray(decompressedFilters.filters)) {
        throw Error('Filter query params are not valid filters');
      }

      //Remove all filters from the fragment array
      modelFilters.length = 0;

      await Promise.all(
        decompressedFilters.filters.map(async fil => {
          const newFragmentFields = {
            field: fil.field,
            operator: fil.operator,
            rawValues: fil.values,
            dimension: this.metadataService.getById('dimension', fil.dimension)
          };

          const newFragment = this.store.createFragment('bard-request/fragments/filter', newFragmentFields);
          modelFilters.pushObject(newFragment);
        })
      );
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
  resetController(controller, isExiting /*transition*/) {
    this._super(...arguments);

    if (isExiting) {
      //Reset hasEntered state to false as we exit the route
      this.set('hasEntered', false);
      controller.resetModel();
    }
  }
});
