/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';

import { get } from '@ember/object';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: service(),

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
     * @param {Object} metric - metadata model of metric to remove
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
    [RequestActions.ADD_METRIC_WITH_PARAM]({ currentModel }, metric, parameters) {
      get(currentModel, 'request').addRequestMetricWithParam(metric, parameters);
    },

    /**
     * @action REMOVE_METRIC_WITH_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to add
     * @param {Object} parameter - selected metric parameter
     */
    [RequestActions.REMOVE_METRIC_WITH_PARAM]({ currentModel }, metric, parameters) {
      get(currentModel, 'request').removeRequestMetricWithParam(metric, parameters);
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     */
    [RequestActions.ADD_METRIC_FILTER](route, metric, parameters) {
      // Metric filter can't exist without the metric present in the request
      if (parameters) {
        get(this, 'requestActionDispatcher').dispatch(RequestActions.ADD_METRIC_WITH_PARAM, route, metric, parameters);
      } else {
        get(this, 'requestActionDispatcher').dispatch(RequestActions.ADD_METRIC, route, metric);
      }
    },

    /**
     * @action DID_UPDATE_TIME_GRAIN
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} timeGrain - newly updated time grain
     */
    [RequestActions.DID_UPDATE_TIME_GRAIN](route, timeGrain) {
      let request = get(route, 'currentModel.request'),
        timeGrainMetrics = get(timeGrain, 'metrics');

      get(request, 'metrics')
        .mapBy('metric')
        .forEach(metric => {
          if (!timeGrainMetrics.includes(metric)) {
            get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_METRIC, route, metric);
          }
        });
    }
  }
});
