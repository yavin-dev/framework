/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Goal Gauge Visualization
 * This file registers the visualization with navi
 */
import ManifestBase from './base';

export default ManifestBase.extend({
  /**
   * @property name
   */
  name: 'goal-gauge',

  /**
   * @property niceName
   */
  niceName: 'Goal Gauge',

  /**
   * @property icon
   */
  icon: 'tachometer',

  /**
   * Decides whether visualization type is valid given request
   *
   * @method typeIsValid
   * @param {Object} request - request object
   * @return {Boolean} - visualization type is valid
   */
  typeIsValid(request) {
    return this.hasNoGroupBy(request) && this.hasSingleTimeBucket(request) && this.hasSingleMetric(request);
  }
});
