/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';
import { get, getWithDefault } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { merge, flow } from 'lodash-es';
import { task, all, didCancel } from 'ember-concurrency';
import { computed } from '@ember/object';
import { v1 } from 'ember-uuid';
import config from 'ember-get-config';
import { isForbidden } from 'navi-core/helpers/is-forbidden';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';

const FETCH_MAX_CONCURRENCY = config.navi.widgetsRequestsMaxConcurrency || Infinity;

export default class DashboardDataService extends Service {
  /**
   * @property {Service} naviFacts
   */
  @service naviFacts;

  /**
   * @property {Service} store
   */
  @service store;

  /**
   * @property {Object} widgetOptions - options for the fact request
   */
  @computed
  get widgetOptions() {
    return {
      page: 1,
      perPage: 10000
    };
  }

  /**
   * @method fetchDataForDashboard
   * @param {Object} dashboard - dashboard model
   * @returns {Promise} - Promise that resolves to a hash of the widget id to its TaskInstance
   */
  async fetchDataForDashboard(dashboard) {
    const widgets = await dashboard.widgets;
    const layout = dashboard.presentation?.layout;

    return this.fetchDataForWidgets(dashboard.id, widgets, layout, [], this.widgetOptions);
  }

  /**
   * @method fetchDataForWidgets
   * @param {Number} dashboardId
   * @param {Array} widgets - list of widget models with requests to fetch
   * @param {Array} layout - dashboard layout
   * @param {Array} decorators - array of functions to modify each request
   * @param {Object} options - options for web service fetch
   * @returns {Object} hash of the widget id to its TaskInstance
   */
  fetchDataForWidgets(dashboardId, widgets = [], layout = [], decorators = [], options = {}) {
    const uuid = v1(),
      taskByWidget = {};

    // sort widgets by order in layout
    const sortedWidgets = arr(layout)
      .sortBy('row', 'column')
      .map(layoutItem => widgets.find(widget => widget.id == layoutItem.widgetId))
      .filter(widget => widget);

    sortedWidgets.forEach(widget => {
      const taskInstance = this._fetchRequestsForWidget.perform(dashboardId, widget, decorators, options, uuid);

      taskByWidget[widget.id] = taskInstance;

      /**
       * bubbling 403 errors causes acceptance test to fail https://github.com/emberjs/ember-qunit/issues/592
       * task still expectedly fails.
       * TODO: no need for catch block when ^ resolves (needlessly catches task cancelation errors as well)
       */
      taskInstance.catch(e => {
        if (didCancel(e) || isForbidden(e)) {
          return;
        }
        throw e;
      });
    });

    return taskByWidget;
  }

  /**
   * @property {Task} _fetchRequestsForWidget
   * @private
   * @param {Number} dashboardId
   * @param {Object} widget - dashboard widget model
   * @param {Array} decorators - array of functions to modify each request
   * @param {Object} options - options for web service fetch
   * @param {String} uuid - v1 UUID
   * @yields {TaskInstance}
   */
  @task(function*(dashboardId, widget, decorators, options, uuid) {
    const { dashboard, requests, id: widgetId } = widget;
    const fetchTasks = [];

    requests.forEach(request => {
      //construct custom header for each widget with uuid
      options.customHeaders = {
        uiView: `dashboard.${dashboardId}.${uuid}.${widgetId}`
      };

      options.dataSourceName = request.dataSource || getDefaultDataSourceName();

      const requestWithFilters = this._applyFilters(dashboard, request);
      const requestDecorated = this._decorate(decorators, requestWithFilters.serialize());
      const filterErrors = this._getFilterErrors(dashboard, request);

      fetchTasks.push(this._fetchRequest.perform(requestDecorated, options, filterErrors));
    });

    return yield fetchTasks.length ? all(fetchTasks) : [];
  })
  _fetchRequestsForWidget;

  /**
   * @property {Task} _fetchRequest
   * @private
   * @param {Object} request
   * @param {Object} options - options for web service fetch
   * @param {Array} filterErrors - invalid Filter error objects
   * @yields {TaskInstance}
   */
  @(task(function*(request, options, filterErrors) {
    return yield this._fetch(request, options, filterErrors).then(result => {
      const serverErrors = getWithDefault(result, 'response.meta.errors', []);

      return merge({}, result, { response: { meta: { errors: [...serverErrors, ...filterErrors] } } });
    });
  })
    .enqueue()
    .maxConcurrency(FETCH_MAX_CONCURRENCY))
  _fetchRequest;

  /**
   * @method _fetch
   * @private
   * @param {Object} request - object to modify
   * @param {Object} options - options for web service fetch
   * @returns {Promise} response from request
   */
  _fetch(request, options) {
    return this.naviFacts.fetch(request, options);
  }

  /**
   * @method _decorate
   * @private
   * @param {Array} decorators - array of functions to modify request
   * @param {Object} request - object to modify
   * @returns {Object} transformed version of request
   */
  _decorate(decorators, request) {
    return isEmpty(decorators) ? request : flow(...decorators)(request);
  }

  /**
   * Takes a dashboard and a request on a widget in that
   * dashboard and returns a new request object filtered with
   * applicable global dashboard filters.
   *
   * @param {Object} dashboard
   * @param {Object} request
   * @returns {Object}
   */
  _applyFilters(dashboard, request) {
    const requestClone = request.clone();
    this._getValidGlobalFilters(dashboard, request)
      .filter(filter => get(filter, 'values').length > 0)
      .forEach(filter => requestClone.addFilter(filter));

    return requestClone;
  }

  /**
   * Finds the invalid global filters for a
   * request and return them.
   *
   * @param {Object} dashboard
   * @param {Object} request
   * @returns {Array<Object>}
   */
  _getInvalidGlobalFilters(dashboard, request) {
    const filters = get(dashboard, 'filters') || [];

    return filters.filter(filter => !this._isFilterValid(request, filter));
  }

  /**
   * Finds the valid global filters for a
   * request and return them.
   *
   * @param {Object} dashboard
   * @param {Object} request
   * @returns {Array<Object>}
   */
  _getValidGlobalFilters(dashboard, request) {
    const filters = get(dashboard, 'filters') || [];

    return filters.filter(filter => this._isFilterValid(request, filter));
  }

  /**
   * Generate the Invalid Filter error objects for a
   * request on a widget in a dashboard.
   *
   * @param {Object} dashboard
   * @param {Object} request
   * @return {Array<Object>}
   */
  _getFilterErrors(dashboard, request) {
    const invalidFilters = this._getInvalidGlobalFilters(dashboard, request);

    return invalidFilters.map(filter => ({
      detail: `"${filter.field}" is not a dimension in the "${request.table}" table.`,
      title: 'Invalid Filter'
    }));
  }

  /**
   *
   * @param {Object} request
   * @param {Object} filter
   * @returns {Boolean}
   */
  _isFilterValid(request, filter) {
    const validDimensions = request.tableMetadata.dimensionIds;

    return filter.source === request.dataSource && validDimensions.includes(filter.columnMetadata.id);
  }
}
