/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Base Manifest File
 * This file registers the visualization with navi
 *
 */
import { assert } from '@ember/debug';
import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @property name
   */
  name: undefined,

  /**
   * @property niceName
   */
  niceName: undefined,

  /**
   * @property icon
   */
  icon: undefined,

  /**
   * @method hasSingleMetric
   * @param {Object} request
   * @returns {Boolean} has single metric
   */
  hasSingleMetric(request) {
    return request.metricColumns.length === 1;
  },

  /**
   * @method hasNoMetric
   * @param {Object} request
   * @returns {Boolean} has no metrics
   */
  hasNoMetric(request) {
    return request.metricColumns.length === 0;
  },

  /**
   * @method hasMetric
   * @param {Object} request
   * @returns {Boolean} has some metrics
   */
  hasMetric(request) {
    return !this.hasNoMetric(request);
  },

  /**
   * @method hasSingleTimeBucket
   * @param {Object} request
   * @returns {Boolean} has single time bucket
   */
  hasInterval(request) {
    const { timeGrain, interval } = request;

    return timeGrain && interval;
  },

  /**
   * @method hasSingleTimeBucket
   * @param {Object} request
   * @returns {Boolean} has single time bucket
   */
  hasSingleTimeBucket(request) {
    const { timeGrain, interval } = request;

    return this.hasInterval(request) && interval.diffForTimePeriod(timeGrain) === 1;
  },

  /**
   * @method hasNoGroupBy
   * @param {Object} request
   * @returns {Boolean} has no group by
   */
  hasNoGroupBy(request) {
    return request.columns.filter(({ type }) => type === 'dimension').length === 0;
  },

  /**
   * @method hasMultipleMetrics
   * @param {Object} request
   * @returns {Boolean} has multiple metrics
   */
  hasMultipleMetrics(request) {
    return request.metricColumns.length > 1;
  },

  /**
   * @method hasMultipleTimeBuckets
   * @param {Object} request
   * @returns {Boolean} has multiple time buckets
   */
  hasMultipleTimeBuckets(request) {
    return this.hasInterval(request) && !this.hasSingleTimeBucket(request);
  },

  /**
   * @method hasGroupBy
   * @param {Object} request
   * @returns {Boolean} has group by
   */
  hasGroupBy(request) {
    return !this.hasNoGroupBy(request);
  },

  /**
   * Decides whether visualization type is valid given request
   *
   * @method typeIsValid
   * @param {Object} request - request object
   * @return {Boolean} - visualization type is valid
   */
  typeIsValid(/*request*/) {
    assert(`typeIsValid is not implemented in ${this.niceName}`);
  }
});
