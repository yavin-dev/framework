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
import BaseCellRenderer from './base';
import { isEmpty } from '@ember/utils';
import numeral from 'numeral';

export default class MetricCellRenderer extends BaseCellRenderer {
  /**
   * value to be rendered on the cell
   */
  get displayValue(): string {
    const { columnValue } = this;

    if (isEmpty(columnValue)) {
      return '--';
    }

    const { format } = this.args.column.attributes;
    if (format) {
      return numeral(columnValue).format(format);
    }

    return `${columnValue}`;
  }
}
