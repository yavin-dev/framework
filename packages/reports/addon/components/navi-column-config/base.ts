/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Base Component
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import type FunctionParameterMetadataModel from 'navi-data/models/metadata/function-parameter';
import type { ColumnFunctionParametersValues } from 'navi-data/models/metadata/function-parameter';
import type { ConfigColumn } from '../navi-column-config';
import type { SortDirection } from 'navi-data/adapters/facts/interface';

interface NaviColumnConfigBaseArgs {
  column: ConfigColumn;
  cloneColumn(): void;
  onAddFilter(): void;
  onUpsertSort(direction: SortDirection): void;
  onRemoveSort(): void;
  onRenameColumn(newColumnName?: string): void;
  onUpdateColumnParam(param: string, paramValue: string): void;
  toggleRollup(): void;
  supportsSubtotal: boolean;
}

type AllDirectionSort = SortDirection | 'none';
type FakeSortParam = { name: string; id: AllDirectionSort };

export default class NaviColumnConfigBase extends Component<NaviColumnConfigBaseArgs> {
  classId = guidFor(this);

  sortDirections: FakeSortParam[] = [
    { name: 'None', id: 'none' },
    { name: 'Descending', id: 'desc' },
    { name: 'Ascending', id: 'asc' },
  ];

  get apiColumnName(): string {
    return this.args.column.fragment.columnMetadata.name;
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
