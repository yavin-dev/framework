/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <NumberFormatDropdown
 *    @column={{@column}}
 *    @onUpdateFormat{{action @onUpdateFormat}}
 *  />
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { merge } from 'lodash-es';
import { TableColumn } from './navi-visualizations/table';

interface Args {
  column: TableColumn;
  onUpdateReport(action: 'updateColumn', column: TableColumn): void;
}

export default class NumberFormatDropdownComponent extends Component<Args> {
  @tracked format?: string;

  @tracked isActive = false;

  constructor(owner: unknown, args: Args) {
    super(owner, args);
    this.format = this.args.column.attributes.format;
  }

  @action
  updateColumnNumberFormat() {
    const { onUpdateReport, column } = this.args;
    const format = this.format ?? column.attributes.format;
    const updatedColumn = merge({}, column, { attributes: { format } });

    onUpdateReport('updateColumn', updatedColumn);
  }

  /**
   *
   * @param format - The new format for the number
   */
  @action
  setFormat(format?: string) {
    this.format = format;
  }

  @action
  toggleIsActive() {
    this.isActive = !this.isActive;
  }
}
