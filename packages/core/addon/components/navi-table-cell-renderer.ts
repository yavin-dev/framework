/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Picks the correct cell renderer to use. Allows for extension in apps.
 *
 * Usage:
 * <NaviTableCellRenderer
 *     @column={{this.column}}
 *     @data={{this.data}}
 *     @request={{this.request}}
 * />
 */
import Component from '@glimmer/component';
import { dasherize } from '@ember/string';
import RequestFragment from 'navi-core/models/request';
import { TableColumn } from './navi-visualizations/table';
import type { ResponseRow } from 'navi-data/models/navi-fact-response';

// TODO: Better Column/data type
export type CellRendererArgs = {
  data: ResponseRow;
  column: TableColumn;
  request: RequestFragment;
  isRollup: boolean;
  isGrandTotal: boolean;
};

export default class NaviTableCellRenderer extends Component<CellRendererArgs> {
  prefix = 'navi-cell-renderers/';

  /**
   * Chooses which cell renderer to use based on type of column
   */
  get cellRenderer() {
    const { prefix } = this;
    const { type } = this.args.column.fragment;
    return `${prefix}${dasherize(type)}`;
  }
}
