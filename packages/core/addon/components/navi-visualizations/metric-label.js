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
import { computed } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class MetricLabel extends Component {
  /**
   * @property {String} fontSize
   * font size is small, medium, or large depending on the length of the value
   * returns the appropriate font class
   */
  @computed('value')
  get fontSize() {
    const value = this.value;
    const length = value?.length || 0;

    if (length > 11) {
      return 'metric-label-vis__font--small';
    } else if (length <= 11 && length > 4) {
      return 'metric-label-vis__font--medium';
    } else {
      return 'metric-label-vis__font--large';
    }
  }

  /**
   * @property {String} value
   * formats if there is a formatter configured
   */
  @computed('options.{metric,value,format}', 'model.[]')
  get value() {
    if (this.model) {
      const options = this.options || {};
      const firstRow = this.model?.firstObject?.response?.rows?.[0];
      const value = firstRow[canonicalizeMetric(options.metric)];

      return options.format ? numeral(value).format(options.format) : String(value);
    }
    return undefined;
  }

  /**
   * @property {String} description
   * returns the configured description
   * empty string is a valid description
   */
  @computed('options.description', 'model.[]')
  get description() {
    if (this.model) {
      return this.options?.description;
    }
    return undefined;
  }
}
