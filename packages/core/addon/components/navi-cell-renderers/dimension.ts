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

import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { CellRendererArgs } from '../navi-table-cell-renderer';

export default class DimensionCellRenderer extends Component<CellRendererArgs> {
  /**
   * value that should be displayed in table cell
   */
  get value() {
    const { canonicalName } = this.args.column.fragment;
    const { data } = this.args;

    if (!isEmpty(data?.[canonicalName])) {
      return data[canonicalName];
    }

    return '--';
  }
}
