/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::Metric
 *   @data={{row}}
 *   @column={{column}}
 *   @request={{request}}
 *   @requestColumn={{request}}
 * />
 */
import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { smartFormatNumber } from 'navi-core/helpers/smart-format-number';
import { CellRendererArgs } from '../navi-table-cell-renderer';
import numeral from 'numeral';
import { canonicalizeMetric } from 'navi-data/utils/metric';

export default class MetricCellRenderer extends Component<CellRendererArgs> {
  /**
   * value to be rendered on the cell
   */
  get metricValue(): string {
    const { column, data } = this.args;
    const { type, field, parameters } = column;
    const format = column.attributes?.format;
    const canonicalName = canonicalizeMetric({ metric: field, parameters });
    const metricValue = data?.[canonicalName];

    if (isEmpty(metricValue)) {
      return '--';
    }

    if (format) {
      return numeral(metricValue).format(format);
    }

    return type === 'metric' ? smartFormatNumber([metricValue]) : `${metricValue}`;
  }
}
