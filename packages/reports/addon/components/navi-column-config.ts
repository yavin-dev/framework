/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getDataSource } from 'navi-data/utils/adapter';
import type ReportModel from 'navi-core/models/report';
import type ColumnFragment from 'navi-core/models/request/column';
import type { Parameters, SortDirection } from '@yavin/client/request';
import type ColumnMetadataModel from 'navi-data/models/metadata/column';
import type RequestConstrainer from 'navi-reports/services/request-constrainer';

interface NaviColumnConfigArgs {
  report: ReportModel;
  lastAddedColumn: ColumnFragment | null;
  resetLastAddedColumn(): void;
  onAddColumn(metadata: ColumnMetadataModel, parameters: Parameters): void;
  onRemoveColumn(metadata: ColumnMetadataModel, parameters: Parameters): void;
  onAddFilter(column: ColumnFragment): void;
  onUpsertSort(column: ColumnFragment, direction: SortDirection): void;
  onRemoveSort(column: ColumnFragment): void;
  onRenameColumn(column: ColumnFragment, alias: string): void;
  onReorderColumn(column: ColumnFragment, index: number): void;
  onPushRollup(column: ColumnFragment): void;
  onRemoveRollup(column: ColumnFragment): void;
  onUpdateGrandTotal(grandTotal: boolean): void;
}

export type ConfigColumn = {
  isFiltered: boolean;
  isRequired: boolean;
  isRollup: boolean;
  fragment: ColumnFragment;
};

export default class NaviColumnConfig extends Component<NaviColumnConfigArgs> {
  @service
  declare requestConstrainer: RequestConstrainer;

  @tracked
  currentlyOpenColumn?: ConfigColumn;

  /**
   * Dimension and metric columns from the request
   */
  @computed(
    // eslint-disable-next-line ember/use-brace-expansion
    'args.report.request.columns.@each.parameters',
    'args.report.request.filters.[]',
    'args.report.request.rollup.columnCids.[]',
    'args.report.request.sorts.[]',
    'requestConstrainer'
  )
  get columns(): ConfigColumn[] {
    const { request } = this.args.report;
    const requiredColumns = this.requestConstrainer.getConstrainedProperties(request).columns || new Set();
    if (request.table !== undefined) {
      const { columns, filters, rollup } = request;

      const filteredColumns = filters.map(({ canonicalName }) => canonicalName);

      return columns.map((column) => {
        return {
          isFiltered: filteredColumns.includes(column.canonicalName),
          isRequired: requiredColumns.has(column),
          isRollup: rollup.columnCids.includes(column.cid),
          fragment: column,
        };
      });
    }
    return [];
  }

  @computed('args.report.request.dataSource')
  get supportsSubtotal(): boolean {
    //TODO: We shouldn't need this line because TS, but js tests causing a big regression. Remove and fix tests.
    if (!this.args.report.request.dataSource) {
      return false;
    }
    const dataSource = getDataSource<'bard'>(this.args.report.request.dataSource).options;
    return dataSource?.enableSubtotals ?? false;
  }

  /**
   * Adds a copy of the given column to the request including its parameters
   * @param column - The metric/dimension column to make a copy of
   */
  @action
  cloneColumn(column: ConfigColumn) {
    const { columnMetadata, parameters } = column.fragment;
    this.args.onAddColumn(columnMetadata, { ...parameters });
  }

  /**
   * Toggles adding column to rollup list.
   * @param column - column to toggle rollup on
   */
  @action
  toggleRollup(column: ConfigColumn) {
    if (column.isRollup) {
      this.args.onRemoveRollup(column.fragment);
    } else {
      this.args.onPushRollup(column.fragment);
    }
  }

  /**
   * Toggles grandTotal on rollup
   */
  @action
  toggleGrandTotal() {
    this.args.onUpdateGrandTotal(!this.args.report.request.rollup.grandTotal);
  }

  /**
   * @param column - the column fragment to be renamed
   * @param index - the new name for the column
   */
  @action
  reorderColumns(newColumns: ConfigColumn[], draggedColumn: ConfigColumn) {
    this.args.onReorderColumn(draggedColumn.fragment, newColumns.indexOf(draggedColumn));
  }

  /**
   * Opens a column
   * @param column - The column to open
   */
  @action
  openColumn(column: ConfigColumn) {
    this.currentlyOpenColumn = column;
  }
}
