/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import Ember from 'ember';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

const { inject, get } = Ember;

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: inject.service(),

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
          requestSort = requestSorts.findBy('metric.name', metricName);

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
     * @action REMOVE_METRIC
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to remove
     */
    [RequestActions.REMOVE_METRIC](route, metric) {
      // Find and remove any `sorts` attached to the metric
      let metricName = get(metric, 'name');

      get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_SORT, route, metricName);
    },
  }
});
