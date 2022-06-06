/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Base Component
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { parseParameterValue } from 'navi-data/utils/metric';
import type FunctionParameterMetadataModel from '@yavin/client/models/metadata/function-parameter';
import type { ConfigColumn } from '../navi-column-config';
import type { ParameterValue, SortDirection } from '@yavin/client/request';

interface NaviColumnConfigBaseArgs {
  column: ConfigColumn;
  cloneColumn(): void;
  onAddFilter(): void;
  onUpsertSort(direction: SortDirection): void;
  onRemoveSort(): void;
  onRenameColumn(newColumnName?: string): void;
  onUpdateColumnParam(param: string, paramValue: ParameterValue): void;
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
  setParameter(param: FunctionParameterMetadataModel, rawParamValue: ParameterValue) {
    const value = parseParameterValue(param, rawParamValue);
    this.args.onUpdateColumnParam(param.id, value);
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
