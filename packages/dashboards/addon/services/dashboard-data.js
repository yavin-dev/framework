/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';
import { get, getWithDefault } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { merge, flow } from 'lodash';
import { all } from 'rsvp';
import { computed } from '@ember/object';
import { v1 } from 'ember-uuid';
import DS from 'ember-data';

export default Service.extend({
  /**
   * @property {Ember.Service} bardFacts
   */
  bardFacts: service(),

  /**
   * @property {Ember.Service} store
   */
  store: service(),

  /**
   * @property {Object} widgetOptions - options for the fact request
   */
  widgetOptions: computed(function() {
    return {
      page: 1,
      perPage: 10000
    };
  }),

  /**
   * @method fetchDataForDashboard
   * @param {Object} dashboard - dashboard model
   * @returns {Promise} - Promise that resolves to a dashboard object with widget data
   */
  fetchDataForDashboard(dashboard) {
    return dashboard
      .get('widgets')
      .then(widgets => this.fetchDataForWidgets(dashboard.id, widgets, [], get(this, 'widgetOptions')));
  },

  /**
   * @method fetchDataForWidgets
   * @param {Array} widgets - list of widget models with requests to fetch
   * @param {Array} decorators - array of functions to modify each request
   * @param {Object} options - options for web service fetch
   * @returns {Object} hash of widget id to data promise array
   */
  fetchDataForWidgets(dashboardId, widgets = [], decorators = [], options = {}) {
    const result = {};
    const uuid = v1();

    // Construct hash of widget id to data
    widgets.forEach(widget => {
      const widgetId = get(widget, 'id');
      const dashboard = get(widget, 'dashboard');
      const widgetDataPromises = get(widget, 'requests').map(request => {
        //construct custom header for each widget with uuid
        options.customHeaders = {
          uiView: `dashboard.${dashboardId}.${uuid}.${widgetId}`
        };

        const requestWithFilters = this._applyFilters(dashboard, request);
        const requestDecorated = this._decorate(decorators, requestWithFilters.serialize());

        const filterErrors = this._getFilterErrors(dashboard, request);

        return this._fetch(requestDecorated, options).then(result => {
          const serverErrors = getWithDefault(result, 'response.meta.errors', []);

          return merge({}, result, { response: { meta: { errors: [...serverErrors, ...filterErrors] } } });
        });
      });

      result[get(widget, 'id')] = DS.PromiseArray.create({
        promise: all(widgetDataPromises).then(arr) // PromiseArray expects an Ember array returned
      });
    });

    return result;
  },

  /**
   * @method _decorate
   * @private
   * @param {Array} decorators - array of functions to modify request
   * @param {Object} request - object to modify
   * @returns {Object} transformed version of request
   */
  _decorate(decorators, request) {
    if (isEmpty(decorators)) {
      return request;
    } else {
      return flow(...decorators)(request);
    }
  },

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
      .filter(filter => filter.get('rawValues').length > 0)
      .forEach(filter => requestClone.addRawFilter(filter));

    return requestClone;
  },

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
  },

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
  },

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
      detail: `"${get(filter, 'dimension.name')}" is not a dimension in the "${get(
        request,
        'logicalTable.table.name'
      )}" table.`,
      title: 'Invalid Filter'
    }));
  },

  /**
   *
   * @param {Object} request
   * @param {Object} filter
   * @returns {Boolean}
   */
  _isFilterValid(request, filter) {
    const validDimensions = get(request, 'logicalTable.timeGrain.dimensionIds');

    return validDimensions.includes(get(filter, 'dimension.name'));
  },

  /**
   * @method _fetch
   * @private
   * @param {Object} request - object to modify
   * @param {Object} options - options for web service fetch
   * @returns {Promise} response from request
   */
  _fetch(request, options) {
    return get(this, 'bardFacts').fetch(request, options);
  }
});
