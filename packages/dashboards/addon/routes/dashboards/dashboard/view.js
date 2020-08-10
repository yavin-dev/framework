/**
 * Copyright 2020, Yahoo Holdings Inc.
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
  metadataService: service('navi-metadata'),

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
    const filterQueryParams = transition.to.queryParams.filters;
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
      return { dashboard, taskByWidget: cachedWidgetData };
    }

    this._cancelWidgetDataTasks();
    const widgetsData = await this.dashboardData.fetchDataForDashboard(dashboard);
    this.set('_widgetDataCache', widgetsData);

    return { dashboard, taskByWidget: widgetsData };
  },

  /**
   * Cancel running and enqueued widget data tasks, if any
   *
   * @private
   * @method _cancelWidgetDataTasks
   * @returns {Boolean} - true after canceling
   */
  _cancelWidgetDataTasks() {
    const { id: dashboardId } = this.modelFor('dashboards.dashboard');
    const { _widgetDataCache } = this;

    if (!_widgetDataCache) {
      return true;
    }

    for (const [widgetId, widgetTask] of Object.entries(_widgetDataCache)) {
      widgetTask.cancel(`dashboard ${dashboardId} canceled widget task ${widgetId}`);
    }

    return true;
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
      if (modelFilters.get('length') > 0) {
        modelFilters.removeAt(0, modelFilters.get('length'));
      }

      decompressedFilters.filters.map(fil => {
        const newFragmentFields = {
          field: fil.field,
          operator: fil.operator,
          rawValues: fil.values,
          dimension: this.metadataService.getById('dimension', fil.dimension, fil.dataSource)
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
   * @method deactivate - cancel tasks and reset filters, cache on exit of route
   */
  deactivate() {
    this._super(...arguments);

    this.controller.set('filters', null);

    this.set('_widgetDataCache', null);
  },

  actions: {
    /**
     * @override
     * @action willTransition
     * @param {Transition} transition
     */
    willTransition(transition) {
      //don't cancel on filters updates, cancelation is in the `model` hook if model or filter values have changed
      if (transition.targetName !== this.routeName && transition.targetName !== 'dashboards.dashboard.index') {
        this._cancelWidgetDataTasks();
      }
      return true;
    }
  }
});
