/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { set } from '@ember/object';
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
     * @param {String} metricName - canonical name of the metric
     * @param {String} direction - the direction of the new sort
     */
    [RequestActions.UPSERT_SORT]({ currentModel: { request } }, metricName, direction) {
      const sort = request.sorts.find(sort => sort.canonicalName === metricName);

      if (sort) {
        set(sort, 'direction', direction);
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
     * @param {String} metricName - canonical name of the metric
     */
    [RequestActions.REMOVE_SORT]({ currentModel: { request } }, metricName) {
      request.removeSortByMetricName(metricName);
    },

    /**
     * @action REMOVE_SORT_WITH_PARAMS
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metricMetadataModel - metadata model of metric to remove from sort
     * @param {Object} parameters - metric parameters
     */
    [RequestActions.REMOVE_SORT_WITH_PARAMS]({ currentModel: { request } }, metricMetadataModel, parameters) {
      request.removeSortWithParams(metricMetadataModel, parameters);
    },

    /**
     * @action REMOVE_SORT_BY_COLUMN_META
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to remove from sort
     */
    [RequestActions.REMOVE_SORT_BY_COLUMN_META]({ currentModel: { request } }, metricMetadataModel) {
      request.removeSortByMeta(metricMetadataModel);
    },

    /**
     * @action REMOVE_METRIC
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metricMetadataModel - metadata model of metric to remove
     */
    [RequestActions.REMOVE_COLUMN](route, metricMetadataModel) {
      // Find and remove any `sorts` attached to the metric
      this.requestActionDispatcher.dispatch(RequestActions.REMOVE_SORT_BY_COLUMN_META, route, metricMetadataModel);
    },

    /**
     * @action REMOVE_COLUMN_WITH_PARAMS
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metricMetadataModel - metadata model of metric to remove
     * @param {Object} parameters - metric parameters
     */
    [RequestActions.REMOVE_COLUMN_WITH_PARAMS](route, metricMetadataModel, parameters) {
      // Find and remove any `sorts` attached to the metric and parameters
      this.requestActionDispatcher.dispatch(
        RequestActions.REMOVE_SORT_WITH_PARAMS,
        route,
        metricMetadataModel,
        parameters
      );
    },

    /**
     * @action REMOVE_COLUMN_FRAGMENT
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} columnFragment - the fragment of the column to remove sort
     */
    [RequestActions.REMOVE_COLUMN_FRAGMENT](route, columnFragment) {
      // Find and remove any `sorts` attached to the metric and parameters
      this.requestActionDispatcher.dispatch(
        RequestActions.REMOVE_SORT_WITH_PARAMS,
        route,
        columnFragment.columnMetadata,
        columnFragment.parameters
      );
    },

    /**
     * Remove all metric sorts of same base metric if a param is updated
     * @action UPDATE_COLUMN_FRAGMENT_WITH_PARAMS
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} columnFragment - the fragment of the column to remove sort
     */
    [RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS](route, columnFragment) {
      this.requestActionDispatcher.dispatch(
        RequestActions.REMOVE_SORT_BY_COLUMN_META,
        route,
        columnFragment.columnMetadata
      );
    }
  }
});
