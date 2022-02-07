/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviVisualizations::Table
 *   @model={{model}}
 *   @isEditing={{isEditing}}
 *   @options={{options}}
 *   @onUpdateReport={{action 'onUpdateReport'}}
 * />
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { readOnly } from '@ember/object/computed';
import { action, computed } from '@ember/object';
import { groupBy } from 'lodash-es';
import EmberArray from '@ember/array';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import type RequestFragment from 'navi-core/models/request';
import type { TableVisualizationMetadata, TableColumnAttributes } from 'navi-core/serializers/table';
import type ColumnFragment from 'navi-core/models/request/column';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';
import type { ResponseRow } from 'navi-data/models/navi-fact-response';
import type { SortDirection } from 'navi-data/adapters/facts/interface';

const HEADER_TITLE = {
  grandTotal: 'Grand Total',
  subtotal: 'Subtotal',
};
export type TotalType = keyof typeof HEADER_TITLE;

export type TableSortDirection = SortDirection | 'none';
const NEXT_SORT_DIRECTION: Record<TableSortDirection, TableSortDirection> = {
  none: 'desc',
  desc: 'asc',
  asc: 'none',
};

export type TotalRow = ResponseRow;

type UpdateAction = string;
export type VisualizationModelEntry = { request: RequestFragment; response: NaviFactResponse };
export type VisualizationModel = EmberArray<VisualizationModelEntry>;
export type Args = {
  model: VisualizationModel;
  options: TableVisualizationMetadata['metadata'];
  isEditing?: boolean;
  onUpdateReport: (action: UpdateAction, ...params: unknown[]) => void;
};

export type TableColumn = {
  fragment: ColumnFragment;
  attributes: TableColumnAttributes;
  sortDirection: TableSortDirection | null;
  columnId: string;
};

export default class Table extends Component<Args> {
  @tracked extraClassNames = '';

  /*
   * whether or not to incremental render
   */
  @tracked occlusion = true;

  @readOnly('args.options.showTotals.subtotal')
  selectedSubtotal!: string;

  /**
   * data from the WS
   */
  @readOnly('args.model.firstObject.response.rows')
  rawData!: ResponseRow[];

  /**
   * total rows for the request
   */
  @readOnly('args.model.firstObject.response.meta.pagination.numberOfResults')
  totalRows!: number;

  /**
   * rows in response from WS
   */
  @readOnly('args.model.firstObject.response.rows.length')
  rowsInResponse!: number;

  @tracked componentElement?: HTMLElement;

  /**
   * Stores element reference to table
   * @param element - element inserted
   */
  @action
  setupElement(element: HTMLElement): void {
    this.componentElement = element;
  }

  /**
   * Determines whether table columns can be reordered
   */
  get isDraggingDisabled(): boolean {
    return !!this.componentElement?.parentElement?.classList.contains('navi-widget__content');
  }

  /**
   * Compute total for a metric column
   * Returns sum of values, may be overriden with your own logic
   */
  computeColumnTotal(
    data: ResponseRow[],
    metricName: string,
    _totalRow: TotalRow,
    _column: TableColumn,
    _type: TotalType
  ): number {
    return data.reduce((sum: number, row: ResponseRow) => {
      let number = Number(row[metricName]);
      return Number.isNaN(number) ? sum : sum + number;
    }, 0);
  }

  /**
   * Compute total for all metrics in the data
   */
  _computeTotal(data: ResponseRow[], totalType: TotalType): TotalRow {
    const { columns, totalRows, rowsInResponse, selectedSubtotal } = this;
    const hasPartialData = totalRows > rowsInResponse;

    let hasTitle = false;
    let totalRow = columns.reduce((totRow: TotalRow, column) => {
      const { canonicalName, type } = column.fragment;

      if (type === 'timeDimension' && !hasTitle) {
        totRow[canonicalName] = HEADER_TITLE[totalType];
        hasTitle = true;
      }

      //set subtotal dimension if subtotal row
      if (type === 'dimension' && column.columnId === selectedSubtotal && totalType === 'subtotal') {
        totRow[canonicalName] = data[0][canonicalName];
      }

      //if metric and not partial data compute totals
      if (type === 'metric' && column.attributes.canAggregateSubtotal !== false && !hasPartialData) {
        totRow[canonicalName] = this.computeColumnTotal(data, canonicalName, totRow, column, totalType);
      }

      return totRow;
    }, {});

    //TODO type me
    totalRow.__meta__ = {
      isTotalRow: true,
      hasPartialData,
    };

    return totalRow as ResponseRow;
  }

  /**
   * Adds meta into rows for serverside data rollups
   */
  _mapRollups(tableData: ResponseRow[], request: RequestFragment) {
    if (request?.rollup?.columnCids?.length <= 0 && !request?.rollup?.grandTotal) {
      return tableData;
    }
    const dimensionCount = new Set(request?.columns.filter((col) => col.type !== 'metric').map((col) => col.field))
      .size;
    const fullMask = parseInt(new Array(dimensionCount).fill('1').join(''), 2);
    return tableData.map((row) => {
      if (row.__rollupMask === undefined || row.__rollupMask === null) {
        return row;
      }
      const rollupMask = Number(row.__rollupMask);
      row.__meta__ = {
        isRollup: rollupMask !== fullMask,
        isGrandTotal: rollupMask === 0,
      };
      return row;
    });
  }

  /**
   * Compute subtotal for selected dimension in the data
   *
   * @returns data with subtotal rows
   */
  private _computeSubtotals(): ResponseRow[] {
    const { selectedSubtotal: groupingColumn, rawData, groupedData } = this;

    if (groupingColumn === undefined) {
      return rawData;
    }

    return Object.keys(groupedData).reduce((arr, group) => {
      const subTotalRow = this._computeTotal(groupedData[group], 'subtotal');
      return [...arr, ...groupedData[group], subTotalRow];
    }, []);
  }

  /**
   * data grouped by grouping column specified in selectedSubtotal
   */
  @computed('selectedSubtotal', 'rawData', 'request.{columns.[]}')
  get groupedData(): Record<string, ResponseRow[]> {
    let { selectedSubtotal, rawData, request } = this;
    const canonicalName = request.columns.find((column) => column.cid === selectedSubtotal)?.canonicalName as string;

    return groupBy(rawData, (row: ResponseRow) => row[canonicalName]);
  }

  @computed('rawData', 'selectedSubtotal', 'args.options.showTotals.grandTotal', 'groupedData', 'request')
  get tableData(): ResponseRow[] {
    const { rawData } = this;
    let tableData = this._computeSubtotals();

    tableData = this._mapRollups(tableData, this.request);

    if (!this.args.options?.showTotals?.grandTotal) {
      return tableData;
    }

    return [...tableData, this._computeTotal(rawData, 'grandTotal')];
  }

  @computed('args.options.columnAttributes', 'request.{columns.[],sorts.[]}')
  get columns(): TableColumn[] {
    const { columnAttributes = {} } = this.args.options;
    return this.request.columns.map((column) => {
      let sortDirection: TableColumn['sortDirection'];
      if (column.columnMetadata.isSortable) {
        const sort = this.request.sorts.find((sort) => sort.canonicalName === column.canonicalName);
        sortDirection = sort?.direction || <const>'none';
      } else {
        sortDirection = null;
      }
      return {
        fragment: column,
        attributes: columnAttributes[column.cid] || {},
        sortDirection,
        columnId: column.cid,
      };
    });
  }

  /**
   * Determines table edit state
   */
  get isEditingMode(): boolean {
    return featureFlag('enableTableEditing') && !!this.args.isEditing;
  }

  get isVerticalCollectionEnabled(): boolean {
    return featureFlag('enableVerticalCollectionTableIterator');
  }

  get tableRenderer(): string {
    return `table-renderer${this.isVerticalCollectionEnabled ? '-vertical-collection' : ''}`;
  }

  @readOnly('args.model.firstObject.request')
  request!: RequestFragment;

  /**
   * prefix for all cell renderer types
   */
  cellRendererPrefix = 'navi-cell-renderers/';

  /**
   * estimated height in px of a single row
   */
  get estimateHeight(): number {
    return this.isVerticalCollectionEnabled ? 32 : 30;
  }

  /**
   * size of the buffer before and after the collection
   */
  bufferSize = 10;

  /**
   * Get next direction based on column type and current direction
   *
   * @param type - column type
   * @param sortDirection - current sort direction
   * @returns next direction
   */
  _getNextSortDirection(_type: ColumnFragment['type'], sortDirection: TableSortDirection): TableSortDirection {
    return NEXT_SORT_DIRECTION[sortDirection];
  }

  /**
   * sends sort action when column header is clicked
   */
  @action
  headerClicked({ target }: { target: HTMLElement }): void {
    const columnId = target.closest('li')?.getAttribute('data-column-id');
    if (!columnId) {
      return;
    }

    const column = this.columns.find((c) => c.columnId === columnId);
    if (!column?.fragment.columnMetadata.isSortable) {
      return;
    }

    const { type } = column.fragment;
    const sort = this.request.sorts.find((sort) => sort.canonicalName === column.fragment.canonicalName);
    const sortDirection = (sort?.direction || 'none') as TableSortDirection;
    const direction = this._getNextSortDirection(type, sortDirection);
    //TODO Fetch from report action dispatcher service
    if (direction === 'none') {
      this.args.onUpdateReport('removeSort', column.fragment);
    } else {
      this.args.onUpdateReport('upsertSort', column.fragment, direction);
    }
  }

  @action
  updateColumnOrder(newColumnOrder: TableColumn[]): void {
    this.args.onUpdateReport('updateColumnOrder', newColumnOrder);
  }

  @action
  updateColumnDisplayName(column: ColumnFragment, alias: string | undefined): void {
    this.args.onUpdateReport('renameColumnFragment', column, alias);
  }
}
