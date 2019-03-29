/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Base Manifest File
 * This file registers the visualization with navi
 *
 */
import { assert } from '@ember/debug';
import EmberObject, { get } from '@ember/object';

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
    return get(request, 'metrics.length') === 1;
  },

  /**
   * @method hasSingleTimeBucket
   * @param {Object} request
   * @returns {Boolean} has single time bucket
   */
  hasSingleTimeBucket(request) {
    let timeGrain = get(request, 'logicalTable.timeGrain.name'),
      numTimeBuckets = get(request, 'intervals.firstObject.interval').diffForTimePeriod(timeGrain);

    return numTimeBuckets === 1;
  },

  /**
   * @method hasNoGroupBy
   * @param {Object} request
   * @returns {Boolean} has no group by
   */
  hasNoGroupBy(request) {
    return get(request, 'dimensions.length') === 0;
  },

  /**
   * @method hasMultipleMetrics
   * @param {Object} request
   * @returns {Boolean} has multiple metrics
   */
  hasMultipleMetrics(request) {
    return !this.hasSingleMetric(request);
  },

  /**
   * @method hasMultipleTimeBuckets
   * @param {Object} request
   * @returns {Boolean} has multiple time buckets
   */
  hasMultipleTimeBuckets(request) {
    return !this.hasSingleTimeBucket(request);
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
