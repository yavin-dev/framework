/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: service(),

  actions: {
    /**
     * @action UPSERT_SORT
     * @param {Object} route - route that has a model that contains a request property
     * @param {String} metricName
     * @param {String} direction
     */
    [RequestActions.UPSERT_SORT]({ currentModel }, metricName, direction) {
      let request = get(currentModel, 'request'),
          requestSorts = get(request, 'sort'),
          requestSort = requestSorts.findBy('metric.canonicalName', metricName);

      if (requestSort) {
        requestSort.set('direction', direction);
      } else {
        if (metricName === 'dateTime') {
          request.addDateTimeSort(direction);
        } else {
          request.addSortByMetricName(metricName, direction);
        }
      }
    },

    /**
     * @action REMOVE_SORT
     * @param {Object} route - route that has a model that contains a request property
     * @param {String} metricName
     */
    [RequestActions.REMOVE_SORT]({ currentModel }, metricName) {
      let request = get(currentModel, 'request');

      request.removeSortByMetricName(metricName);
    },

    /**
     * @action REMOVE_SORT_WITH_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to remove from sort
     * @param {Object} parameters - metric parameters
     */
    [RequestActions.REMOVE_SORT_WITH_PARAM]({ currentModel }, metric, parameters) {
      let request = get(currentModel, 'request');

      request.removeSortMetricWithParam(metric, parameters);
    },

    /**
     * @action REMOVE_SORT_BY_METRIC_MODEL
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to remove from sort
     */
    [RequestActions.REMOVE_SORT_BY_METRIC_MODEL]({ currentModel }, metric) {
      let request = get(currentModel, 'request');

      request.removeSortMetricByModel(metric);
    },

    /**
     * @action REMOVE_METRIC
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to remove
     */
    [RequestActions.REMOVE_METRIC](route, metric) {
      // Find and remove any `sorts` attached to the metric
      get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_SORT_BY_METRIC_MODEL, route, metric);
    },

    /**
     * @action REMOVE_METRIC_WITH_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to remove
     * @param {Object} parameters - metric parameters
     */
    [RequestActions.REMOVE_METRIC_WITH_PARAM](route, metric, parameters) {
      // Find and remove any `sorts` attached to the metric and parameters
      get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_SORT_WITH_PARAM, route, metric, parameters);
    },
  }
});
