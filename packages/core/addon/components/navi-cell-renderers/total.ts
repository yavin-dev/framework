/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::Total
 *   @data={{this.row}}
 *   @column={{this.column}}
 *   @request={{this.request}}
 * />
 */

import Component from '@glimmer/component';
import { CellRendererArgs } from '../navi-table-cell-renderer';

export default class TotalCellRenderer extends Component<CellRendererArgs> {}
