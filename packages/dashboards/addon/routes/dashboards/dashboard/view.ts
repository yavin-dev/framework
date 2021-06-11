/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type DashboardModel from 'navi-core/models/dashboard';
import type DashboardDataService from 'navi-dashboards/services/dashboard-data';
import type { WidgetRequests } from 'navi-dashboards/services/dashboard-data';
import type { Filter } from 'navi-data/adapters/facts/interface';
import type CompressionService from 'navi-core/services/compression';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { Transition, ModelFrom } from 'navi-core/utils/type-utils';
import type StoreService from '@ember-data/store';
import type { URLFilter } from 'navi-dashboards/controllers/dashboards/dashboard/view';
import type DashboardsDashboardViewController from 'navi-dashboards/controllers/dashboards/dashboard/view';
import type DashboardsDashboardRoute from 'navi-dashboards/routes/dashboards/dashboard';

export default class DashboardsDashboardViewRoute extends Route {
  @service
  declare dashboardData: DashboardDataService;

  @service
  declare compression: CompressionService;

  @service('navi-metadata')
  declare metadataService: NaviMetadataService;

  @service
  declare store: StoreService;

  @service
  declare naviNotifications: NaviNotificationsService;

  declare controller: DashboardsDashboardViewController;

  /**
   * stores most recent widget data
   */
  @tracked _widgetDataCache: WidgetRequests | null = null;

  /**
   * any time the filters query params changes, rerun the model hook
   */
  queryParams = {
    filters: {
      refreshModel: true,
    },
  };

  /**
   * Adds filters from query params to the dashboard then
   * makes an ajax request to retrieve relevant widgets in the dashboard
   */
  async model(_params: object, transition: Transition) {
    const dashboard = this.modelFor('dashboards.dashboard') as ModelFrom<DashboardsDashboardRoute>;
    const filterQueryParams = transition.to.queryParams.filters;
    const cachedWidgetData = this._widgetDataCache;

    //Record filters before and after setting from query params
    const originalFilters = dashboard.filters.serialize() as Filter[];
    try {
      await this._addFiltersFromQueryParams(dashboard, filterQueryParams);
    } catch (e) {
      this.naviNotifications.add({
        title: `Error decoding filter query params. Using default dashboard filters.`,
        style: 'danger',
        timeout: 'medium',
      });
    }
    const newFilters = dashboard.filters.serialize() as Filter[];

    const originalValuelessFilters = originalFilters.filter((fil) => fil.values.length === 0);
    const newValuelessFilters = newFilters.filter((fil) => fil.values.length === 0);

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
    this._widgetDataCache = widgetsData;

    return { dashboard, taskByWidget: widgetsData };
  }

  /**
   * Cancel running and enqueued widget data tasks, if any
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
  }

  /**
   * Update Model to have dirty attributes that match the filter query params
   */
  async _addFiltersFromQueryParams(dashboard: DashboardModel, filterQueryParams = '') {
    const modelFilters = dashboard.filters;

    if (isEmpty(filterQueryParams)) {
      return;
    }

    try {
      const decompressedFilters = (await this.compression.decompress(filterQueryParams)) as { filters?: URLFilter[] };

      if (!('filters' in decompressedFilters) || !Array.isArray(decompressedFilters.filters)) {
        throw Error('Filter query params are not valid filters');
      }

      //Remove all filters from the fragment array
      if (modelFilters.length > 0) {
        modelFilters.removeAt(0, modelFilters.length);
      }

      decompressedFilters.filters.map((fil) => {
        const newFragmentFields = {
          type: fil.type,
          field: fil.field,
          parameters: fil.parameters,
          operator: fil.operator,
          values: fil.values,
          source: fil.source,
        };

        const newFragment = this.store.createFragment('bard-request-v2/fragments/filter', newFragmentFields);
        modelFilters.pushObject(newFragment);
      });
    } catch (e) {
      throw Error(`Error decompressing filter query params: ${filterQueryParams}\n${e}`);
    }
  }

  /**
   * @override
   * @method deactivate - cancel tasks and reset filters, cache on exit of route
   */
  deactivate() {
    super.deactivate();

    this.controller.set('filters', null);

    this._widgetDataCache = null;
  }

  @action
  willTransition(transition: Transition) {
    //don't cancel on filters updates, cancellation is in the `model` hook if model or filter values have changed
    if (transition.to.name !== this.routeName && transition.to.name !== 'dashboards.dashboard.index') {
      this._cancelWidgetDataTasks();
    }
    return true;
  }
}
