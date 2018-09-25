/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{cell-renderers/threshold
 *   data=row
 *   column=column
 *   request=request
 * }}
 */

import MetricRender from 'navi-core/components/cell-renderers/metric';
import { computed, get } from '@ember/object';

export default MetricRender.extend({
  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-cell-content', 'threshold'],

  /**
   * @property {Array} classNameBindings - Binding with component class names
   */
  classNameBindings: ['valueIndicator'],

  /**
   * @property {String} - classname binding to render the actual metric value
   */
  valueIndicator: computed('metricValue', function() {
    let metricValue = get(this, 'metricValue'),
      indicator = 'neutral';

    if (metricValue > 0) {
      indicator = 'strong';
    }
    if (metricValue < 0) {
      indicator = 'weak';
    }

    return indicator;
  })
});
