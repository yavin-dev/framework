/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import RequestFragment from 'navi-core/models/request';
//@ts-ignore
import { searchRecords } from 'navi-core/utils/search';
import ColumnMetadataModel from 'navi-data/models/metadata/column';
import { groupBy } from 'lodash-es';

interface ColumnSelectorArgs {
  title: string;
  allColumns: Array<ColumnMetadataModel>;
  request: RequestFragment;
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

  get isSingleCategory() {
    const grouped = groupBy(this.args.allColumns, (row) => row.category?.split(',')[0] || `Uncategorized`);
    return Object.keys(grouped).length === 1;
  }
}
