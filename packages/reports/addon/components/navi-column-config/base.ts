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
import type { ConfigColumn } from '../navi-column-config';
import type { SortDirection } from 'navi-data/adapters/facts/interface';
import { DataType } from 'navi-data/models/metadata/function-parameter';

interface NaviColumnConfigBaseArgs {
  column: ConfigColumn;
  cloneColumn(): void;
  onAddFilter(): void;
  onUpsertSort(direction: SortDirection): void;
  onRemoveSort(): void;
  onRenameColumn(newColumnName?: string): void;
  onUpdateColumnParam(param: string, paramValue: string | number | boolean): void;
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
    return this.args.column.fragment.columnMetadata.id;
  }

  @action
  setParameter(param: FunctionParameterMetadataModel, rawParamValue: string | number | boolean) {
    let paramValue = rawParamValue;
    if ([DataType.INTEGER, DataType.DECIMAL].includes(param.type)) {
      paramValue = Number(rawParamValue);
    } else if (DataType.BOOLEAN === param.type) {
      paramValue = Boolean(rawParamValue);
    }

    this.args.onUpdateColumnParam(param.id, paramValue);
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
