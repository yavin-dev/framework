/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Pie Chart Visualization
 * This file registers the visualization with navi
 *
 */
import ManifestBase from './base';

export default ManifestBase.extend({
  /**
   * @property name
   */
  name: 'pie-chart',

  /**
   * @property niceName
   */
  niceName: 'Pie Chart',

  /**
   * @property icon
   */
  icon: 'pie-chart',

  /**
   * Decides whether visualization type is valid given request
   *
   * @method typeIsValid
   * @param {Object} request - request object
   * @return {Boolean} - visualization type is valid
   */
  typeIsValid(request) {
    return (
      this.hasSingleTimeBucket(request) &&
      this.hasMetric(request) &&
      (this.hasGroupBy(request) || this.hasMultipleMetrics(request))
    );
  }
});
