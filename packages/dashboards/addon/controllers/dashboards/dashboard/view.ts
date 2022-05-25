/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { isEqual } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ReportToWidget from 'navi-dashboards/mixins/controllers/report-to-widget';
import type CompressionService from 'navi-core/services/compression';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type DashboardModel from 'navi-core/models/dashboard';
import type FilterFragment from 'navi-core/models/request/filter';
import type { Filter } from '@yavin/client/request';
import {
  findDefaultOperator,
  getDefaultValuesForTimeFilter,
} from 'navi-reports/components/filter-builders/time-dimension';

export type URLFilter = Filter & { source: string };
export type InitialFilter = Pick<URLFilter, 'type' | 'field' | 'source'>;

function urlFilter(filter: FilterFragment): URLFilter {
  return {
    ...(filter.serialize() as Filter),
    source: filter.source,
  };
}

function dashboardURLFilters(dashboard: DashboardModel): URLFilter[] {
  return dashboard.filters.toArray().map((filter) => urlFilter(filter));
}

export default class DashboardsDashboardViewController extends Controller.extend(ReportToWidget) {
  @service
  declare compression: CompressionService;

  @service('navi-metadata')
  declare metadataService: NaviMetadataService;

  queryParams = ['filters', 'lastAddedWidgetId'];

  /**
   * query param holding encoded filters for the dashboard
   */
  @tracked filters: string | null = null;

  @tracked lastAddedWidgetId: string | null = null;

  @action
  async updateFilter(dashboard: DashboardModel, originalFilter: FilterFragment, changeSet: Partial<Filter>) {
    const origFilter = urlFilter(originalFilter);
    const newFilters = dashboardURLFilters(dashboard);
    let filterToUpdate = newFilters.find((fil) => isEqual(fil, origFilter));
    if (!filterToUpdate) {
      return;
    }

    const newFilter: URLFilter = { ...filterToUpdate, ...changeSet };

    const index = newFilters.indexOf(filterToUpdate);
    newFilters[index] = newFilter;

    const filterQueryParams = await this.compression.compress({ filters: newFilters });

    this.transitionToRoute('dashboards.dashboard', {
      queryParams: { filters: filterQueryParams, lastAddedWidgetId: null },
    });
  }

  @action
  async removeFilter(dashboard: DashboardModel, filter: FilterFragment) {
    const removedFilter = urlFilter(filter);
    const newFilters = dashboardURLFilters(dashboard).filter((fil) => !isEqual(fil, removedFilter));
    const filterQueryParams = await this.compression.compress({ filters: newFilters });

    this.transitionToRoute('dashboards.dashboard', {
      queryParams: { filters: filterQueryParams, lastAddedWidgetId: null },
    });
  }

  @action
  async addFilter(dashboard: DashboardModel, filter: InitialFilter) {
    const filters = dashboardURLFilters(dashboard);
    const dimensionMeta = this.metadataService.getById(filter.type, filter.field, filter.source);
    const defaultOperator = findDefaultOperator(dimensionMeta?.valueType ?? '');
    const defaultParams = dimensionMeta?.getDefaultParameters() || {};
    const newFilter: URLFilter = {
      type: filter.type,
      field: filter.field,
      parameters: defaultParams,
      operator: defaultOperator,
      values: [],
      source: filter.source,
    };

    let values;
    if (dimensionMeta?.metadataType === 'timeDimension' && defaultOperator === 'bet') {
      values = getDefaultValuesForTimeFilter(newFilter);
    }

    filters.push({
      ...newFilter,
      ...(values ? { values } : {}),
    });

    const filterQueryParams = await this.compression.compress({ filters });

    this.transitionToRoute('dashboards.dashboard', {
      queryParams: { filters: filterQueryParams, lastAddedWidgetId: null },
    });
  }

  /**
   * Remove query params as model enters clean state
   */
  @action
  clearQueryParams() {
    this.filters = null;
    this.lastAddedWidgetId = null;
  }
}
