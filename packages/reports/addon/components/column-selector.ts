/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
//@ts-ignore
import { searchRecords } from 'navi-core/utils/search';
import ColumnMetadataModel from 'navi-data/models/metadata/column';

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

    //let tempColumns = allColumns.filter(column => column.name.indexOf('Revenue'))
    let tempColumns = allColumns.filter(
      (column) => column.name.toLocaleLowerCase().includes('revenue')
      //Object.keys(column).some(o => column.name.toLocaleLowerCase().includes('revenue'))
    );
    console.log('Columns ', allColumns);
    console.log('tempColumns ', tempColumns);
    if (query) console.log('query:', query);

    return query ? searchRecords(tempColumns, query, 'name') : tempColumns;
  }
}
