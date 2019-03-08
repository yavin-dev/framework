/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';

import { assign } from '@ember/polyfills';
import { setProperties, set, get } from '@ember/object';
import { assert } from '@ember/debug';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { getSelectedMetricsOfBase, getUnfilteredMetricsOfBase } from 'navi-reports/utils/request-metric';
import { isEmpty } from '@ember/utils';
import IntervalFragment from 'navi-core/models/bard-request/fragments/interval';
import { featureFlag } from 'navi-core/helpers/feature-flag';

const DEFAULT_METRIC_FILTER = {
  operator: 'gt',
  values: 0
};

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: service(),

  /**
   * @method _getNextParameterForMetric
   *
   * @private
   * @param metricMeta - metadata object of metric
   * @param request - request fragment
   * @returns {Object|undefined} next parameters object
   */
  _getNextParameterForMetric(metricMeta, request) {
    if (!get(metricMeta, 'hasParameters')) {
      return;
    }

    if (isEmpty(getSelectedMetricsOfBase(metricMeta, request))) {
      return metricMeta.getDefaultParameters();
    }

    let nextMetric = getUnfilteredMetricsOfBase(metricMeta, request)[0];
    return nextMetric && get(nextMetric, 'parameters');
  },

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
      if (!filter) {
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
      assert(
        'Dimension model has correct primaryKeyFieldName',
        typeof get(dimension, 'primaryKeyFieldName') === 'string'
      );
      let defaultOperator = featureFlag('dateDimensionFilter') && get(dimension, 'datatype') === 'date' ? 'gte' : 'in';

      get(currentModel, 'request').addFilter({
        dimension,
        operator: defaultOperator,
        field: get(dimension, 'primaryKeyFieldName'),
        values: []
      });
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     * @param {Object} [parameters] - metric parameters to filter [optional]
     */
    [RequestActions.ADD_METRIC_FILTER]: ({ currentModel }, metric, parameters) => {
      let newHavingMetric = { metric };

      if (parameters) {
        newHavingMetric = assign(newHavingMetric, { parameters });
      }

      get(currentModel, 'request').addHaving(assign({ metric: newHavingMetric }, DEFAULT_METRIC_FILTER));
    },

    /**
     * @action TOGGLE_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     */
    [RequestActions.TOGGLE_METRIC_FILTER]: function(route, metric) {
      let filteredMetrics = get(route, 'currentModel.request.having'),
        havingsForMetric = filteredMetrics.filterBy('metric.metric.name', get(metric, 'name')),
        nextParameter = this._getNextParameterForMetric(metric, get(route, 'currentModel.request')),
        shouldAdd = !!nextParameter || isEmpty(havingsForMetric);

      if (shouldAdd) {
        get(this, 'requestActionDispatcher').dispatch(RequestActions.ADD_METRIC_FILTER, route, metric, nextParameter);
      } else {
        havingsForMetric.forEach(having => {
          get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_FILTER, route, having);
        });
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
          having =>
            get(having, 'metric.canonicalName') === canonicalizeMetric({ metric: get(metric, 'name'), parameters })
        );

      if (!having) {
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

      havings.forEach(having =>
        get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_FILTER, route, having)
      );
    },

    /**
     * @action UPDATE_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} originalFilter - object to update
     * @param {Object} changeSet - object of properties and new values
     */
    [RequestActions.UPDATE_FILTER]: (route, originalFilter, changeSet) => {
      let changeSetUpdates = {};

      //If the interval is set in a dimension filter (rather than datetime filter), set values instead of the interval property
      if (get(changeSet, 'interval') && !(originalFilter instanceof IntervalFragment)) {
        let intervalAsStrings = get(changeSet, 'interval').asStrings('YYYY-MM-DD');
        changeSetUpdates = { values: [`${intervalAsStrings.start}/${intervalAsStrings.end}`] };
        delete changeSet.interval;
      }
      setProperties(originalFilter, Object.assign({}, changeSet, changeSetUpdates));
    },

    /**
     * @action UPDATE_FILTER_PARAM
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} originalFilter - object to update
     */
    [RequestActions.UPDATE_FILTER_PARAM]: (route, originalFilter, key, value) => {
      set(originalFilter, 'subject.parameters', {
        [key]: value
      });
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
      let request = get(route, 'currentModel.request'),
        interval = get(request, 'intervals.firstObject.interval'),
        timeGrainName = get(timeGrain, 'name'),
        newInterval = interval
          ? interval.asIntervalForTimePeriod(timeGrainName)
          : DefaultIntervals.getDefault(timeGrainName);

      set(request, 'intervals.firstObject.interval', newInterval);

      // Remove any dimension filter if the dim is not present in new time grain
      let timeGrainDimensions = get(timeGrain, 'dimensions');

      /*
       * .toArray() is used to clone the array, otherwise removing a filter while
       * iterating over `request.filters` causes problems
       */
      get(request, 'filters')
        .toArray()
        .forEach(dimensionFilter => {
          let dimension = get(dimensionFilter, 'dimension');

          if (!timeGrainDimensions.includes(dimension)) {
            get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_FILTER, route, dimensionFilter);
          }
        });

      /*
       * Having filters are already taken care of:
       * DID_UPDATE_TIME_GRAIN triggers REMOVE_METRIC triggers REMOVE_FILTER
       */
    }
  }
});
