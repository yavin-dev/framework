/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { featureFlag } from 'navi-core/helpers/feature-flag';

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
      currentModel.request.addRequestMetricByModel(metric);
    },

    /**
     * @action REMOVE_METRIC
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to remove
     */
    [RequestActions.REMOVE_METRIC]({ currentModel }, metric) {
      currentModel.request.removeRequestMetricByModel(metric);
    },

    /**
     * @action REMOVE_METRIC_FRAGMENT
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - DS.Fragment of a metric that should be removed from the request
     */
    [RequestActions.REMOVE_METRIC_FRAGMENT]({ currentModel }, metric) {
      currentModel.request.removeRequestMetric(metric);
    },

    /**
     * @action ADD_METRIC_WITH_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to add
     * @param {Object} parameter - selected metric parameter
     */
    [RequestActions.ADD_METRIC_WITH_PARAM]({ currentModel }, metric, parameters) {
      currentModel.request.addRequestMetricWithParam(metric, parameters);
    },

    /**
     * @action UPDATE_METRIC_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {String} metric - canonical name of metric to add
     * @param {String} parameterId - id property of parameter object, value of param
     * @param {String} parameterKey - type of parameter, e.g. 'currency'
     */
    [RequestActions.UPDATE_METRIC_PARAM]({ currentModel }, metric, parameterId, parameterKey) {
      const metricModel = currentModel.request.metrics.findBy('canonicalName', metric);

      metricModel && metricModel.updateParameter(parameterId, parameterKey);
    },

    /**
     * @action UPDATE_METRIC_FRAGMENT_WITH_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric fragment to change param of
     * @param {String} parameterId - id property of parameter object, value of param
     * @param {String} parameterKey - type of parameter, e.g. 'currency'
     */
    [RequestActions.UPDATE_METRIC_FRAGMENT_WITH_PARAM](route, metricModel, parameterId, parameterKey) {
      metricModel?.updateParameter?.(parameterId, parameterKey);
    },

    /**
     * @action REMOVE_METRIC_WITH_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metadata model of metric to add
     * @param {Object} parameter - selected metric parameter
     */
    [RequestActions.REMOVE_METRIC_WITH_PARAM]({ currentModel }, metric, parameters) {
      currentModel.request.removeRequestMetricWithParam(metric, parameters);
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     */
    [RequestActions.ADD_METRIC_FILTER](route, metric, parameters) {
      // Metric filter can't exist without the metric present in the request

      if (featureFlag('enableRequestPreview') && route.currentModel.request.metrics.mapBy('metric').includes(metric)) {
        // When adding a metric filter with the requestPreview, users can add multiple of the same metric
        // So if the metric already exists we assume they don't want to add it again
        return;
      }

      if (parameters) {
        this.requestActionDispatcher.dispatch(RequestActions.ADD_METRIC_WITH_PARAM, route, metric, parameters);
      } else {
        this.requestActionDispatcher.dispatch(RequestActions.ADD_METRIC, route, metric);
      }
    },

    /**
     * @action DID_UPDATE_TABLE
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} table - newly updated table
     */
    [RequestActions.DID_UPDATE_TABLE](route, table) {
      let request = route.currentModel.request,
        tableMetrics = table.metrics;

      request.metrics.mapBy('metric').forEach(metric => {
        if (!tableMetrics.includes(metric)) {
          this.requestActionDispatcher.dispatch(RequestActions.REMOVE_METRIC, route, metric);
        }
      });
    }
  }
});
