/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::Metric
 *   @data={{row}}
 *   @column={{column}}
 *   @request={{request}}
 * />
 */

import Component from '@ember/component';
import layout from '../../templates/components/navi-cell-renderers/metric';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { canonicalizeColumnAttributes } from 'navi-data/utils/metric';
import { smartFormatNumber } from 'navi-core/helpers/smart-format-number';
import numeral from 'numeral';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class MetricCellRenderer extends Component {
  /**
   * @property {Object} attributes - metric name and optional parameters used to fetch the value for
   */
  @readOnly('column.attributes')
  attributes;

  /**
   * @property {Number} - value to be rendered on the cell
   */
  @computed('data', 'attributes')
  get metricValue() {
    const format = this.attributes?.format;
    const type = this.column?.type;
    const canonicalName = canonicalizeColumnAttributes(this.attributes);
    const metricValue = this.data?.[canonicalName];

    if (isEmpty(metricValue)) {
      return '--';
    }

    if (format) {
      return numeral(metricValue).format(format);
    }

    return type === 'metric' ? smartFormatNumber([metricValue]) : metricValue;
  }
}
