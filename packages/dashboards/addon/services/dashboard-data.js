/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';
import { get, getWithDefault } from '@ember/object';
import { inject } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { merge, flow } from 'lodash';
import { v1 } from 'ember-uuid';
import DS from 'ember-data';
import RSVP from 'rsvp';
import Service from '@ember/service';

export default Service.extend({
  /**
   * @property {Ember.Service} bardFacts
   */
  bardFacts: inject(),

  /**
   * @property {Ember.Service} store
   */
  store: inject(),

  /**
   * @property {Object} widgetOptions - options for the fact request
   */
  widgetOptions: {
    page: 1,
    perPage: 10000
  },

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
      const widgetDataPromises = get(widget, 'requests').map(request => {
        //construct custom header for each widget with uuid
        options.customHeaders = {
          uiView: `dashboard.${dashboardId}.${uuid}.${widgetId}`
        };

        request = this._applyFilters(widget, request);
        request = this._decorate(decorators, request.serialize());

        const filterErrors = this._getFilterErrors(widget);

        return this._fetch(request, options).then(result => {
          const serverErrors = getWithDefault(result, 'response.errors', []);

          return merge({}, result, {
            response: {
              errors: [...serverErrors, ...filterErrors]
            }
          });
        });
      });

      result[get(widget, 'id')] = DS.PromiseArray.create({
        promise: RSVP.all(widgetDataPromises).then(arr) // PromiseArray expects an Ember array returned
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
   * Takes a widget and a request on that widget and
   * applys the filters from the widget's dashboard to
   * the widget's request.
   *
   * @param {Object} widget
   * @param {Object} request
   * @returns {Object}
   */
  _applyFilters(widget, request) {
    const requestClone = request.clone();

    this._getValidGlobalFilters(widget).forEach(filter => requestClone.addFilter(filter));

    return requestClone;
  },

  /**
   * Finds the invalid global filters for a
   * widget and returns them.
   *
   * @param {Object} widget
   * @returns {Array<Object>}
   */
  _getInvalidGlobalFilters(widget) {
    const filters = getWithDefault(widget, 'dashboard.filters', []);

    return filters.filter(filter => !this._isFilterValid(widget, filter));
  },

  /**
   *
   * @param {Object} widget
   */
  _getFilterErrors(widget) {
    const invalidFilters = this._getInvalidGlobalFilters(widget);

    return invalidFilters.map(filter => ({
      detail: `"${get(filter, 'dimension.name')}" is not a dimension in the "${get(
        widget,
        'request.logicalTable.table.name'
      )}" table.`,
      title: 'Invalid Filter'
    }));
  },

  /**
   * Finds the valid global filters for a
   * widget and returns them.
   *
   * @param {Object} widget
   * @returns {Array<Object>}
   */
  _getValidGlobalFilters(widget) {
    const filters = getWithDefault(widget, 'dashboard.filters', []);

    return filters.filter(filter => this._isFilterValid(widget, filter));
  },

  /**
   *
   * @param {Object} widget
   * @param {Object} filter
   * @returns {Boolean}
   */
  _isFilterValid(widget, filter) {
    const validDimensions = []; // get(widget, 'request.logicalTable.timeGrain.dimensionIds');

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
