/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';
import Service, { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { merge, flow } from 'lodash-es';
import { task, all, didCancel } from 'ember-concurrency';
import { v1 } from 'ember-uuid';
import config from 'ember-get-config';
//@ts-ignore
import { isForbidden } from 'navi-core/helpers/is-forbidden';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import { taskFor } from 'ember-concurrency-ts';
import type { RequestOptions, RequestV2 } from 'navi-data/adapters/facts/interface';
import type Store from '@ember-data/store';
import type NaviFactsService from 'navi-data/services/navi-facts';
import type LayoutFragment from 'navi-core/models/fragments/layout';
import type DashboardModel from 'navi-core/models/dashboard';
import type NaviFactsModel from 'navi-data/models/navi-facts';
import type DashboardWidgetModel from 'navi-core/models/dashboard-widget';
import type RequestFragment from 'navi-core/models/request';
import type FilterFragment from 'navi-core/models/request/filter';
import type { TaskInstance, TaskGenerator } from 'ember-concurrency';

const FETCH_MAX_CONCURRENCY = config.navi.widgetsRequestsMaxConcurrency || Infinity;

export type FilterError = { title: string; detail: string };
type RequestDecorator = (request: RequestV2) => RequestV2;
export type NaviFactsWithRequestFragment = NaviFactsModel & { request: RequestFragment };
export type WidgetData = NaviFactsWithRequestFragment[];
export type WidgetDataTask = TaskInstance<WidgetData>;
export type WidgetDataTaskByWidgetId = Record<string, WidgetDataTask>;

export default class DashboardDataService extends Service {
  @service
  declare naviFacts: NaviFactsService;

  @service
  declare store: Store;

  /**
   * @property {Object} widgetOptions - options for the fact request
   */
  get widgetOptions() {
    return {
      page: 1,
      perPage: 10000,
    };
  }

  /**
   * @returns Promise that resolves to a hash of the widget id to its TaskInstance
   */
  async fetchDataForDashboard(dashboard: DashboardModel) {
    const widgets = await dashboard.widgets;
    const layout = dashboard.presentation?.layout;

    return this.fetchDataForWidgets(widgets.toArray(), layout, [], this.widgetOptions);
  }

  /**
   * Launches tasks for each widget to fetch all requests
   * @returns map of widget id to task instances
   */
  fetchDataForWidgets(
    widgets: DashboardWidgetModel[] = [],
    layout: LayoutFragment[] = [],
    decorators: RequestDecorator[] = [],
    options = {}
  ): WidgetDataTaskByWidgetId {
    const uuid = v1();
    const taskByWidget: WidgetDataTaskByWidgetId = {};

    // sort widgets by order in layout
    const sortedWidgets = arr(layout)
      .sortBy('row', 'column')
      .map((layoutItem) => widgets.find((widget) => Number(widget.id) === layoutItem.widgetId))
      .filter((widget) => widget) as DashboardWidgetModel[];

    sortedWidgets.forEach((widget) => {
      const taskInstance = taskFor(this.fetchRequestsForWidget).perform(widget, decorators, options, uuid);

      taskByWidget[widget.id] = taskInstance;

      /**
       * bubbling 403 errors causes acceptance test to fail https://github.com/emberjs/ember-qunit/issues/592
       * task still expectedly fails.
       * TODO: no need for catch block when ^ resolves (needlessly catches task cancelation errors as well)
       */
      taskInstance.catch((e) => {
        if (didCancel(e) || isForbidden(e)) {
          return;
        }
        throw e;
      });
    });

    return taskByWidget;
  }

  /**
   * Fetches all requests for a given widget
   */
  @task
  protected *fetchRequestsForWidget(
    widget: DashboardWidgetModel,
    decorators: RequestDecorator[],
    options: RequestOptions,
    uuid: string
  ): TaskGenerator<WidgetData> {
    const { requests, id: widgetId } = widget;
    const dashboard: DashboardModel = yield widget.dashboard;
    const fetchTasks: TaskInstance<NaviFactsWithRequestFragment>[] = [];

    requests.forEach((request) => {
      //construct custom header for each widget with uuid
      options.customHeaders = {
        uiView: `dashboard.${dashboard.id}.${uuid}.${widgetId}`,
      };

      options.dataSourceName = request.dataSource || getDefaultDataSourceName();

      const requestWithFilters = this.applyFilters(dashboard, request);
      const filterErrors = this.getFilterErrors(dashboard, request);

      // Replace serialized request with request fragment
      const result: TaskInstance<NaviFactsWithRequestFragment> = taskFor(this.fetchRequest).perform(
        requestWithFilters,
        decorators,
        options,
        filterErrors
      );
      fetchTasks.push(result);
    });

    return yield fetchTasks.length ? all(fetchTasks) : [];
  }

  /**
   * Fetches a request and replaces the serialized request with the fragment
   */
  @task({ enqueue: true, maxConcurrency: FETCH_MAX_CONCURRENCY })
  protected *fetchRequest(
    requestFragment: RequestFragment,
    decorators: RequestDecorator[],
    options: RequestOptions,
    filterErrors: FilterError[]
  ): TaskGenerator<NaviFactsWithRequestFragment> {
    const request = this.decorate(decorators, requestFragment.serialize() as RequestV2);

    const naviFactsModel: NaviFactsModel = yield this.fetch(request, options);
    //@ts-ignore -- TODO is this valid?
    const serverErrors = naviFactsModel.response?.meta?.errors ?? [];

    return merge({}, naviFactsModel, {
      request: requestFragment,
      response: { meta: { errors: [...serverErrors, ...filterErrors] } },
    });
  }

  /**
   * Performs a fetch of the given request
   */
  protected fetch(request: RequestV2, options: RequestOptions): TaskInstance<NaviFactsModel> {
    return taskFor(this.naviFacts.fetch).perform(request, options);
  }

  /**
   * Applies an array of functions to modify the request
   */
  protected decorate(decorators: RequestDecorator[], request: RequestV2): RequestV2 {
    return isEmpty(decorators) ? request : flow(...decorators)(request);
  }

  /**
   * Takes a dashboard and a request on a widget in that
   * dashboard and returns a new request object filtered with
   * applicable global dashboard filters.
   */
  protected applyFilters(dashboard: DashboardModel, request: RequestFragment): RequestFragment {
    const requestClone = request.clone();
    const validFilters = this.getValidGlobalFilters(dashboard, request).filter((filter) => filter.values.length > 0);

    validFilters.forEach((filter) => {
      if (filter.type === 'timeDimension') {
        requestClone.filters
          .toArray()
          .filter((f) => f.source === filter.source && f.field === filter.field)
          .forEach((f) => requestClone.removeFilter(f));
      }
      requestClone.addFilter(filter);
    });

    return requestClone;
  }

  /**
   * Finds the invalid global filters for a request and return them.
   */
  protected getInvalidGlobalFilters(dashboard: DashboardModel, request: RequestFragment): FilterFragment[] {
    const filters = dashboard.filters;

    return filters.filter((filter) => !this.isFilterValid(request, filter));
  }

  /**
   * Finds the valid global filters for a request and return them.
   */
  protected getValidGlobalFilters(dashboard: DashboardModel, request: RequestFragment): FilterFragment[] {
    const filters = dashboard.filters;

    return filters.filter((filter) => this.isFilterValid(request, filter));
  }

  /**
   * Generate the Invalid Filter error objects for a request on a widget in a dashboard.
   */
  protected getFilterErrors(dashboard: DashboardModel, request: RequestFragment): FilterError[] {
    const invalidFilters = this.getInvalidGlobalFilters(dashboard, request);

    return invalidFilters.map((filter) => ({
      detail: `"${filter.field}" is not a dimension in the "${request.table}" table.`,
      title: 'Invalid Filter',
    }));
  }

  /**
   * Checks if a filter can be applied to a request
   */
  protected isFilterValid(request: RequestFragment, filter: FilterFragment): boolean {
    const validDimensions = [
      ...(request.tableMetadata?.dimensionIds ?? []),
      ...(request.tableMetadata?.timeDimensionIds ?? []),
    ];

    return filter.source === request.dataSource && validDimensions.includes(filter.columnMetadata.id);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'dashboard-data': DashboardDataService;
  }
}
