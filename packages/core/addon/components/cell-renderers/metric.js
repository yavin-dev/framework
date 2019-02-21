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
import { computed, get } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { canonicalizeColumnAttributes } from 'navi-data/utils/metric';
import { smartFormatNumber } from 'navi-core/helpers/smart-format-number';
import numeral from 'numeral';

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-cell-content', 'metric'],

  /**
   * @property {Object} attributes - metric name and optional parameters used to fetch the value for
   */
  attributes: oneWay('column.attributes'),

  /**
   * @property {Number} - value to be rendered on the cell
   */
  metricValue: computed('data', 'attributes', function() {
    let format = get(this, 'attributes.format'),
      type = get(this, 'column.type'),
      canonicalName = canonicalizeColumnAttributes(get(this, 'attributes')),
      metricValue = get(this, `data.${canonicalName}`);

    if (isEmpty(metricValue)) {
      return '--';
    }

    if (format) {
      return numeral(metricValue).format(format);
    }

    return type === 'metric' ? smartFormatNumber([metricValue]) : metricValue;
  })
});
