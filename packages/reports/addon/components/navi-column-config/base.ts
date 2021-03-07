/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Base Component
 *
 * Usage:
 *  <NaviColumnConfig::Base
 *    @column={{this.column}}
 *    @onAddFilter={{this.onAddFilter}}
 *    @onRenameColumn={{this.onRenameColumn}}
 *    @onUpdateColumnParam={{this.onUpdateColumnParam}}
 *  />
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import FunctionParameterMetadataModel, {
  ColumnFunctionParametersValues,
} from 'navi-data/models/metadata/function-parameter';
import { ConfigColumn } from '../navi-column-config';
import { SortDirection } from 'navi-data/adapters/facts/interface';

interface NaviColumnConfigBaseArgs {
  column: ConfigColumn;
  cloneColumn(): void;
  onAddFilter(): void;
  onUpsertSort(direction: SortDirection): void;
  onRemoveSort(): void;
  onRenameColumn(newColumnName?: string): void;
  onUpdateColumnParam(param: string, paramValue: string): void;
}

type AllDirectionSort = SortDirection | 'none';
type FakeSortParam = { name: string; id: AllDirectionSort };

export default class NaviColumnConfigBase extends Component<NaviColumnConfigBaseArgs> {
  classId = guidFor(this);

  sortDirections: FakeSortParam[] = [
    { name: 'Remove Sort', id: 'none' },
    { name: 'Descending', id: 'desc' },
    { name: 'Ascending', id: 'asc' },
  ];

  get apiColumnName(): string {
    return this.args.column.fragment.columnMetadata.id;
  }

  @action
  setParameter(param: FunctionParameterMetadataModel, paramValue: ColumnFunctionParametersValues[number]) {
    this.args.onUpdateColumnParam(param.id, paramValue.id);
  }

  @action
  updateSort(direction: AllDirectionSort) {
    if (direction === 'none') {
      this.args.onRemoveSort();
    } else {
      this.args.onUpsertSort(direction);
    }
  }
}
