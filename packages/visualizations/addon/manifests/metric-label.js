/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Metric Label Visualization
 * This file registers the visualization with navi
 *
 */
import ManifestBase from './base';
export default ManifestBase.extend({

  /**
   * @property name
   */
  name: 'metric-label',

  /**
   * @property niceName
   */
  niceName: 'Metric Label',

  /**
   * @property icon
   */
  icon: 'list-alt',

  /**
   * Decides whether visualization type is valid given request
   *
   * @method typeIsValid
   * @param {Object} request - request object
   * @return {Boolean} - visualization type is valid
   */
  typeIsValid(request) {
    return this.hasNoGroupBy(request) &&
           this.hasSingleTimeBucket(request) &&
           this.hasSingleMetric(request);
  }
});
