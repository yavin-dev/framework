/**
 * Copyright 2020, Yahoo Holdings Inc.
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

    if (!isEmpty(columnValue)) {
      return columnValue;
    }

    return '--';
  }
}
