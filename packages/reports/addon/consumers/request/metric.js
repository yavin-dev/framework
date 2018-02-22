/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import Ember from 'ember';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

const { get, inject } = Ember;

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: inject.service(),

  actions: {
    /**
     * @action ADD_METRIC
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to add
     */
    [RequestActions.ADD_METRIC]({ currentModel }, metric) {
      get(currentModel, 'request').addRequestMetricByModel(metric);
    },

    /**
     * @action REMOVE_METRIC
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to add
     */
    [RequestActions.REMOVE_METRIC]({ currentModel }, metric) {
      get(currentModel, 'request').removeRequestMetricByModel(metric);
    },

    /**
     * @action ADD_METRIC_WITH_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to add
     * @param {Object} parameter - selected metric parameter
     */
    [RequestActions.ADD_METRIC_WITH_PARAM]({ currentModel }, metric, parameter) {
      get(currentModel, 'request').addRequestMetricWithParam(metric, parameter);
    },

    /**
     * @action REMOVE_METRIC_WITH_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to add
     * @param {Object} parameter - selected metric parameter
     */
    [RequestActions.REMOVE_METRIC_WITH_PARAM]({ currentModel }, metric, parameter) {
      get(currentModel, 'request').removeRequestMetricWithParam(metric, parameter);
    },

    /**
     * @action TOGGLE_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     */
    [RequestActions.ADD_METRIC_FILTER](route, metric) {
      // Metric filter can't exist without the metric present in the request
      get(this, 'requestActionDispatcher').dispatch(RequestActions.ADD_METRIC, route, metric);
    },

    /**
     * @action DID_UPDATE_TIME_GRAIN
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} timeGrain - newly updated time grain
     */
    [RequestActions.DID_UPDATE_TIME_GRAIN](route, timeGrain) {
      let request = get(route, 'currentModel.request'),
          timeGrainMetrics = get(timeGrain, 'metrics');

      get(request, 'metrics').mapBy('metric').forEach((metric) => {
        if(!timeGrainMetrics.includes(metric)){
          get(this, 'requestActionDispatcher').dispatch(
            RequestActions.REMOVE_METRIC,
            route,
            metric
          );
        }
      });
    }
  }
});
