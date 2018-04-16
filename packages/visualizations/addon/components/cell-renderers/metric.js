/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{cell-renderers/metric
 *   data=row
 *   column=column
 *   request=request
 * }}
 */

import Ember from 'ember';
import layout from '../../templates/components/cell-renderers/metric';
import { smartFormatNumber } from 'navi-core/helpers/smart-format-number';
import { canonicalizeMetric } from 'navi-data/utils/metric';

const { computed, get, isEmpty } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-cell-content', 'metric'],

  /**
   * @property {String} metric - metric name used to fetch the value for
   */
  metric: computed.alias('column.field'),

  /**
   * @property {Number} - value to be rendered on the cell
   */
  metricValue: computed('data', 'metric', function() {
    let metric = get(this, 'metric'),
        canonicalName = canonicalizeMetric(metric),
        metricValue = get(this, `data.${canonicalName}`);

    return (isEmpty(metricValue)) ? '--' : smartFormatNumber([metricValue]);
  }),
});
