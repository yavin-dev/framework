/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{cell-renderers/threshold
 *   data=row
 *   column=column
 *   request=request
 * }}
 */

import Ember from 'ember';
import layout from '../../templates/components/cell-renderers/threshold';
import { canonicalizeMetric } from 'navi-data/utils/metric';

const { computed, get, isEmpty } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-cell-content', 'threshold'],

  /**
   * @property {Array} classNameBindings - Binding with component class names
   */
  classNameBindings: ['valueIndicator'],

  /**
   * @property {String} metric - metric name used to fetch the value for
   */
  metric: computed.alias('column.field'),

  /**
   * @property {Number} - value to be rendered on the cell
   */
  metricValue: computed('data', 'metric', function() {
    let metric = canonicalizeMetric(get(this, 'metric')),
        metricValue = get(this, `data.${metric}`);

    return (isEmpty(metricValue)) ? '--' : metricValue;
  }),

  /**
   * @property {String} - classname binding to render the actual metric value
   */
  valueIndicator: computed('metricValue', function () {
    let metricValue = get(this, 'metricValue'),
        indicator = 'neutral';

    if(metricValue > 0) { indicator='strong'; }
    if(metricValue < 0) { indicator='weak'; }

    return indicator;
  })
});
