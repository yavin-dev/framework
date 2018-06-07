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
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { computed, get } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import numeral from 'numeral';

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-cell-content', 'metric'],

  /**
   * @property {String} metric - metric name used to fetch the value for
   */
  metric: oneWay('column.field'),

  /**
   * @property {String} format - format the number should be rendered
   */
  format: oneWay('column.format'),

  /**
   * @property {Number} - value to be rendered on the cell
   */
  metricValue: computed('data', 'metric', 'format', function() {
    let format = get(this, 'format'),
        canonicalName = canonicalizeMetric(get(this, 'metric')),
        metricValue = get(this, `data.${canonicalName}`)

    if (isEmpty(metricValue)) {
      return '--';
    }

    if (format) {
      return numeral(metricValue).format(format);
    }

    return metricValue;
  }),
});
