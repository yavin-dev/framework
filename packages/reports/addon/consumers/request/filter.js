/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import { setProperties, set } from '@ember/object';
import { assert } from '@ember/debug';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import {
  getSelectedMetricsOfBase,
  getFilteredMetricsOfBase,
  getUnfilteredMetricsOfBase
} from 'navi-reports/utils/request-metric';

const DEFAULT_METRIC_FILTER = {
  operator: 'gt',
  values: [0]
};

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: service(),

  /**
   * @method _getNextParameterForMetric
   *
   *
   * @private
   * @param metricMetadataModel - metadata object of metric
   * @param request - request fragment
   * @returns {Object|undefined} next parameters object
   */
  _getNextParameterForMetric(metricMetadataModel, request) {
    if (!metricMetadataModel.hasParameters) {
      return;
    }

    if (!getSelectedMetricsOfBase(metricMetadataModel, request).length) {
      return metricMetadataModel.getDefaultParameters();
    }

    const nextUnfilteredMetric = getUnfilteredMetricsOfBase(metricMetadataModel, request)[0];
    return nextUnfilteredMetric?.parameters;
  },

  actions: {
    /**
     * @action TOGGLE_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} column - column fragment
     */
    [RequestActions.TOGGLE_FILTER]: function(route, column) {
      const { canonicalName, columnMetadata, type, parameters } = column;
      const filter = route.currentModel.request.filters.find(filter => filter.canonicalName === canonicalName);

      //do not add filter if it already exists
      if (!filter) {
        switch (type) {
          case 'metric':
            this.requestActionDispatcher.dispatch(RequestActions.ADD_METRIC_FILTER, route, columnMetadata, parameters);
            break;
          case 'dimension':
            this.requestActionDispatcher.dispatch(RequestActions.ADD_DIMENSION_FILTER, route, columnMetadata);
            break;
          case 'timeDimension':
            throw new Error('TODO');
        }
      } else {
        switch (type) {
          case 'metric':
            this.requestActionDispatcher.dispatch(
              RequestActions.REMOVE_METRIC_FILTER,
              route,
              columnMetadata,
              parameters
            );
            break;
          case 'dimension':
            this.requestActionDispatcher.dispatch(RequestActions.REMOVE_DIMENSION_FILTER, route, columnMetadata);
            break;
          case 'timeDimension':
            throw new Error('TODO');
        }
      }
    },
    /**
     * @action TOGGLE_DIMENSION_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - dimension to filter
     */
    [RequestActions.TOGGLE_DIMENSION_FILTER]: function(route, dimensionMetadataModel) {
      const filter = route.currentModel.request.filters.find(
        filter => filter.type === 'dimension' && filter.columnMetadata === dimensionMetadataModel
      );

      //do not add filter if it already exists
      if (!filter) {
        this.requestActionDispatcher.dispatch(RequestActions.ADD_DIMENSION_FILTER, route, dimensionMetadataModel);
      } else {
        this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, filter);
      }
    },

    /**
     * @action ADD_DIMENSION_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - dimension to filter
     */
    [RequestActions.ADD_DIMENSION_FILTER]: ({ currentModel: { request } }, dimensionMetadataModel) => {
      assert(
        'Dimension model has correct primaryKeyFieldName',
        typeof dimensionMetadataModel?.primaryKeyFieldName === 'string'
      );

      const findDefaultOperator = type => {
        const opDictionary = {
          date: 'gte',
          number: 'eq',
          default: 'in'
        };

        return opDictionary[type] || opDictionary.default;
      };

      let defaultOperator = findDefaultOperator(dimensionMetadataModel.valueType);

      request.addFilter({
        type: 'dimension',
        dataSource: dimensionMetadataModel.source,
        field: dimensionMetadataModel.id,
        parameters: { field: dimensionMetadataModel.primaryKeyFieldName },
        operator: defaultOperator,
        values: []
      });
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     * @param {Object} [parameters] - metric parameters to filter [optional]
     */
    [RequestActions.ADD_METRIC_FILTER]: ({ currentModel: { request } }, metricMetadataModel, parameters) => {
      request.addFilter({
        type: 'metric',
        dataSource: request.dataSource,
        field: metricMetadataModel.id,
        parameters,
        ...DEFAULT_METRIC_FILTER
      });
    },

    /**
     * @action TOGGLE_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metricMetadataModel - metric to filter
     */
    [RequestActions.TOGGLE_METRIC_FILTER]: function(route, metricMetadataModel) {
      const {
        currentModel: { request }
      } = route;

      const metricFilters = getFilteredMetricsOfBase(metricMetadataModel, request);

      const nextParameter = this._getNextParameterForMetric(metricMetadataModel, request);
      const shouldAdd = !!nextParameter || !metricFilters.length;

      if (shouldAdd) {
        this.requestActionDispatcher.dispatch(
          RequestActions.ADD_METRIC_FILTER,
          route,
          metricMetadataModel,
          nextParameter
        );
      } else {
        metricFilters.forEach(filter => {
          this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, filter);
        });
      }
    },

    /**
     * @action TOGGLE_PARAMETERIZED_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metricMetadataModel - metric to filter
     * @param {Object} parameters - metric parameter to filter
     */
    [RequestActions.TOGGLE_PARAMETERIZED_METRIC_FILTER]: function(route, metricMetadataModel, parameters) {
      const {
        currentModel: { request }
      } = route;

      const filter = request.filters.find(
        filter =>
          filter.type === 'metric' &&
          filter.canonicalName === canonicalizeMetric({ metric: metricMetadataModel.id, parameters })
      );

      if (!filter) {
        this.requestActionDispatcher.dispatch(RequestActions.ADD_METRIC_FILTER, route, metricMetadataModel, parameters);
      } else {
        this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, filter);
      }
    },

    /**
     * @action REMOVE_COLUMN
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} columnMetadataModel - metadata model of column to remove
     */
    [RequestActions.REMOVE_COLUMN](route, columnMetadataModel) {
      // Find and remove all filters attached to the column
      const {
        currentModel: { request }
      } = route;

      const filters = request.filters.filter(filter => filter.columnMetadata === columnMetadataModel);
      filters.forEach(filter => this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, filter));
    },

    /**
     * @action UPDATE_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} originalFilter - object to update
     * @param {Object} changeSet - object of properties and new values
     */
    [RequestActions.UPDATE_FILTER]: (route, originalFilter, changeSet) => {
      let changeSetUpdates = {};
      //if an interval is set on a filter, normalize to a string array
      if (changeSet.interval) {
        const { start, end } = changeSet.interval.asStrings('YYYY-MM-DD');
        changeSetUpdates = { values: [start, end] };
        delete changeSet.interval;
      }

      setProperties(originalFilter, Object.assign({}, changeSet, changeSetUpdates));
    },

    /**
     * @action UPDATE_FILTER_PARAMS
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} originalFilter - object to update
     */
    [RequestActions.UPDATE_FILTER_PARAMS]: (route, originalFilter, key, value) => {
      set(originalFilter, 'parameters', {
        [key]: value
      });
    },

    /**
     * @action REMOVE_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} filter - object to remove from request
     */
    [RequestActions.REMOVE_FILTER]: ({ currentModel: { request } }, filter) => {
      request.removeFilter(filter);
    },

    /**
     * @action DID_UPDATE_TIME_GRAIN
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} timeGrain - newly updated time grain
     */
    [RequestActions.DID_UPDATE_TIME_GRAIN]({ currentModel: { request } }, timeGrain) {
      // Set interval to default for time grain
      const { interval } = request;
      const timeGrainId = timeGrain.id;
      const newInterval = interval?.asIntervalForTimePeriod(timeGrainId) || DefaultIntervals.getDefault(timeGrainId);

      request.updateInterval(newInterval);
    }
  }
});
