/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/metric-label
 *   model=model
 *   options=options
 * }}
 */
import Component from '@ember/component';
import numeral from 'numeral';
import layout from '../../templates/components/navi-visualizations/metric-label';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { get, computed } from '@ember/object';

export default Component.extend({
  /**
   * @property {Object} layout
   */
  layout,

  /**
   * @property {String} fontSize
   * font size is small, medium, or large depending on the length of the value
   * returns the appropriate font class
   */
  fontSize: computed('value', function() {
    let value = get(this, 'value'),
      length = value ? value.length : 0;

    if (length > 11) {
      return 'metric-label-vis__font--small';
    } else if (length <= 11 && length > 4) {
      return 'metric-label-vis__font--medium';
    } else {
      return 'metric-label-vis__font--large';
    }
  }),

  /**
   * @property {String} value
   * formats if there is a formatter configured
   */
  value: computed('options.{metric,value,format}', 'model.[]', function() {
    if (get(this, 'model')) {
      let options = get(this, 'options') || {},
        firstRow = get(this, 'model.firstObject.response.rows.0'),
        value = firstRow[canonicalizeMetric(get(this, 'options.metric'))];

      return options.format ? numeral(value).format(options.format) : String(value);
    }
    return undefined;
  }),

  /**
   * @property {String} description
   * returns the configured description
   * empty string is a valid description
   */
  description: computed('options.description', 'model.[]', function() {
    if (get(this, 'model')) {
      return this.options?.description;
    }
    return undefined;
  }),

  /**
   * @property {Array} classNames
   */
  classNames: ['metric-label-vis']
});
