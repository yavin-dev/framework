/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import ColumnMetadataModel from 'navi-data/models/metadata/column';
import { guidFor } from '@ember/object/internals';
//@ts-ignore
import { searchRecords } from 'navi-core/utils/search';
import { tracked } from '@glimmer/tracking';

interface ColumnSelectorArgs {
  title: string;
  allColumns: Array<ColumnMetadataModel>;
  selectedColumns: Array<ColumnFragment>;
  onAddColumn(column: ColumnMetadataModel): void;
  onAddFilter(column: ColumnMetadataModel): void;
}

export default class ColumnSelector extends Component<ColumnSelectorArgs> {
  @tracked
  query = '';

  guid = guidFor(this);

  get filteredColumns() {
    const {
      query,
      args: { allColumns },
    } = this;

    return query ? searchRecords(allColumns, query, 'name') : allColumns;
  }
}
