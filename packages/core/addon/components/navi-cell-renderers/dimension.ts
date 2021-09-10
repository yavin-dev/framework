/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::Dimension
 *   @data={{this.row}}
 *   @column={{this.column}}
 *   @request={{this.request}}
 * />
 */

import BaseCellRenderer from './base';
import { isEmpty } from '@ember/utils';

export default class DimensionCellRenderer extends BaseCellRenderer {
  /**
   * value that should be displayed in table cell
   */
  get displayValue() {
    const { columnValue } = this;
    const { isRollup, isGrandTotal } = this.args;

    if (!isEmpty(columnValue)) {
      return columnValue;
    }

    if (isGrandTotal) {
      return '';
    }

    if (isRollup) {
      return '\xa0'; //non-breaking space.
    }

    return '--';
  }
}
