/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import Ember from 'ember';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';
import { canonicalizeMetric } from 'navi-data/utils/metric';

const { assign, inject, get, set, setProperties } = Ember;

const DEFAULT_DIM_FILTER = {
  operator: 'in',
  field: 'id',
  values: []
};

const DEFAULT_METRIC_FILTER = {
  operator: 'gt',
  values: 0
};

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: inject.service(),

  actions: {
    /**
     * @action TOGGLE_DIM_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - dimension to filter
     */
    [RequestActions.TOGGLE_DIM_FILTER]: function(route, dimension) {
      let filteredDimensions = get(route, 'currentModel.request.filters'),
          filter = filteredDimensions.findBy('dimension', dimension);

      //do not add filter if it already exists
      if(!filter){
        get(this, 'requestActionDispatcher').dispatch(RequestActions.ADD_DIM_FILTER, route, dimension);
      } else {
        get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_FILTER, route, filter);
      }
    },

    /**
     * @action ADD_DIM_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - dimension to filter
     */
    [RequestActions.ADD_DIM_FILTER]: ({ currentModel }, dimension) => {
      get(currentModel, 'request').addFilter(
        assign({ dimension }, DEFAULT_DIM_FILTER)
      );
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     * @param {Object} [parameters] - metric parameters to filter [optional]
     */
    [RequestActions.ADD_METRIC_FILTER]: ({ currentModel }, metric, parameters) => {
      let newHavingMetric = { metric };

      if(parameters) {
        newHavingMetric = assign(newHavingMetric, { parameters })
      }

      get(currentModel, 'request').addHaving(
        assign({ metric: newHavingMetric }, DEFAULT_METRIC_FILTER)
      );
    },

    /**
     * @action TOGGLE_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     */
    [RequestActions.TOGGLE_METRIC_FILTER]: function(route, metric) {
      let filteredMetrics = get(route, 'currentModel.request.having'),
          having = filteredMetrics.findBy('metric.metric', metric);

      if(!having){
        get(this, 'requestActionDispatcher').dispatch(RequestActions.ADD_METRIC_FILTER, route, metric);
      } else {
        get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_FILTER, route, having);
      }
    },

    /**
     * @action TOGGLE_PARAMETERIZED_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     * @param {Object} parameters - metric parameter to filter
     */
    [RequestActions.TOGGLE_PARAMETERIZED_METRIC_FILTER]: function(route, metric, parameters) {
      let filteredMetrics = get(route, 'currentModel.request.having'),
          //find if having for metric and parameters exists in request using the canonicalName
          having = filteredMetrics.find(
            having => get(having, 'metric.canonicalName') === canonicalizeMetric({ metric: get(metric, 'name'), parameters })
          );

      if(!having){
        get(this, 'requestActionDispatcher').dispatch(RequestActions.ADD_METRIC_FILTER, route, metric, parameters);
      } else {
        get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_FILTER, route, having);
      }
    },

    /**
     * @action REMOVE_METRIC
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to add
     */
    [RequestActions.REMOVE_METRIC](route, metric) {
      // Find and remove all `havings` attached to the metric
      let filteredMetrics = get(route, 'currentModel.request.having'),
          havings = filteredMetrics.filterBy('metric.metric', metric);

      havings.forEach(having => get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_FILTER, route, having));
    },

    /**
     * @action UPDATE_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} originalFilter - object to update
     * @param {Object} changeSet - object of properties and new values
     */
    [RequestActions.UPDATE_FILTER]: (route, originalFilter, changeSet) => {
      setProperties(originalFilter, changeSet);
    },

    /**
     * @action UPDATE_FILTER_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} originalFilter - object to update
     */
    [RequestActions.UPDATE_FILTER_PARAM]: (route, originalFilter, metric, param) => {
      console.log(param);
      debugger;
    },

    /**
     * @action REMOVE_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} filter - object to remove from request
     */
    [RequestActions.REMOVE_FILTER]: ({ currentModel }, filter) => {
      /*
       * Since filters are backed by 3 seperate properties in the request,
       * make sure the filter is removed from each
       */
      get(currentModel, 'request.filters').removeObject(filter);
      get(currentModel, 'request.having').removeObject(filter);
      get(currentModel, 'request.intervals').removeObject(filter);
    },

    /**
     * @action DID_UPDATE_TIME_GRAIN
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} timeGrain - newly updated time grain
     */
    [RequestActions.DID_UPDATE_TIME_GRAIN](route, timeGrain) {
      // Set interval to default for time grain
      let request = get(route, 'currentModel.request');
      set(request, 'intervals.firstObject.interval', DefaultIntervals.getDefault(get(timeGrain, 'name')));

      // Remove any dimension filter if the dim is not present in new time grain
      let timeGrainDimensions = get(timeGrain, 'dimensions');

      /*
       * .toArray() is used to clone the array, otherwise removing a filter while
       * iterating over `request.filters` causes problems
       */
      get(request, 'filters').toArray().forEach((dimensionFilter) => {
        let dimension = get(dimensionFilter, 'dimension');

        if(!timeGrainDimensions.includes(dimension)) {
          get(this, 'requestActionDispatcher').dispatch(
            RequestActions.REMOVE_FILTER,
            route,
            dimensionFilter
          );
        }
      });

      /*
       * Having filters are already taken care of:
       * DID_UPDATE_TIME_GRAIN triggers REMOVE_METRIC triggers REMOVE_FILTER
       */
    }
  }
});
