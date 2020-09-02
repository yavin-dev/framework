/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::TimeDimension
 *   @data={{this.row}}
 *   @column={{this.column}}
 *   @request={{this.request}}
 * />
 */

import Component from '@glimmer/component';
import { CellRendererArgs } from '../navi-table-cell-renderer';

export default class TimeDimensionCellRenderer extends Component<CellRendererArgs> {
  /**
   * Date start time from the response data or 'TOTAL'
   */
  get value() {
    const {
      data,
      column: {
        fragment: { canonicalName }
      }
    } = this.args;
    return data[canonicalName];
  }

  /**
   * Time Grain in request
   */
  get granularity() {
    const { fragment } = this.args.column;
    return fragment.parameters?.grain;
  }
}
