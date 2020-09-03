/**
 * Copyright 2020, Yahoo Holdings Inc.
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
import { readOnly, alias } from '@ember/object/computed';
import { action, computed } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
//@ts-ignore
import { groupBy } from 'lodash-es';
import EmberArray from '@ember/array';
//@ts-ignore
import { featureFlag } from 'navi-core/helpers/feature-flag';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { TableVisualizationMetadata, TableColumnAttributes } from 'navi-core/serializers/table';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';

const HEADER_TITLE = {
  grandTotal: 'Grand Total',
  subtotal: 'Subtotal'
};
type TotalType = keyof typeof HEADER_TITLE;

const NEXT_SORT_DIRECTION = {
  none: 'desc',
  desc: 'asc',
  asc: 'none'
};
type SortDirection = keyof typeof NEXT_SORT_DIRECTION;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResponseRow = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TotalRow = any;

type UpdateAction = string;
export type Args = {
  model: EmberArray<{ request: RequestFragment; response: ResponseRow[] }>;
  options: TableVisualizationMetadata['metadata'];
  isEditing?: boolean;
  onUpdateReport: (action: UpdateAction, ...params: unknown[]) => void;
};

export type TableColumn = {
  fragment: ColumnFragment;
  attributes: TableColumnAttributes;
  columnId: number;
};

export default class Table extends Component<Args> {
  @tracked extraClassNames = '';

  /*
   * whether or not to incremental render
   */
  @tracked occlusion = true;

  @readOnly('args.options.showTotals.subtotal')
  selectedSubtotal!: number;

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
  @alias('args.model.firstObject.response.rows.length')
  rowsInResponse!: number;

  @tracked componentElement?: HTMLElement;

  /**
   * Stores element reference to table
   * @param element - element inserted
   */
  @action
  setupElement(element: HTMLElement) {
    this.componentElement = element;
  }

  /**
   * Determines whether table columns can be reordered
   */
  get isDraggingDisabled() {
    return this.componentElement?.parentElement?.classList.contains('navi-widget__content');
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
  ) {
    return data.reduce((sum: number, row: ResponseRow) => {
      let number = Number(row[metricName]);
      return Number.isNaN(number) ? sum : sum + number;
    }, 0);
  }

  /**
   * Compute total for all metrics in the data
   */
  _computeTotal(data: ResponseRow[], totalType: TotalType) {
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

    totalRow.__meta__ = {
      isTotalRow: true,
      hasPartialData
    };

    return totalRow;
  }

  /**
   * @method _computeSubtotals
   * Compute subtotal for selected dimension in the data
   *
   * @private
   * @returns {Array} data with subtotal rows
   */
  _computeSubtotals() {
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
   * @property {Object} groupedData - data grouped by grouping column specified in selectedSubtotal
   */
  get groupedData() {
    let { selectedSubtotal, rawData, request } = this;
    const canonicalName = request.columns.objectAt(selectedSubtotal)?.canonicalName as string;

    return groupBy(rawData, (row: ResponseRow) => row[canonicalName]);
  }

  /**
   * @property {Object} tableData
   */
  @computed('rawData', 'args.options.showTotals.grandTotal')
  get tableData() {
    const { rawData } = this;
    const tableData = this._computeSubtotals();

    if (!this.args.options?.showTotals?.grandTotal) {
      return tableData;
    }

    return [...tableData, this._computeTotal(rawData, 'grandTotal')];
  }

  /**
   * @property {Object} columns
   */
  @computed('args.options.columnAttributes', 'request.{columns.[],sorts.[]}')
  get columns(): TableColumn[] {
    const { columnAttributes } = this.args.options;
    return this.request.columns.map((column, index) => {
      const sort = this.request.sorts.find(sort => sort.canonicalName === column.canonicalName);
      return {
        fragment: column,
        attributes: columnAttributes[index] || {},
        sortDirection: sort?.direction || 'none',
        columnId: index
      };
    });
  }

  /**
   * Determines table edit state
   */
  get isEditingMode(): boolean {
    return featureFlag('enableTableEditing') && !!this.args.isEditing;
  }

  /**
   * @property {Boolean} isVerticalCollectionEnabled
   */
  get isVerticalCollectionEnabled(): boolean {
    return featureFlag('enableVerticalCollectionTableIterator');
  }

  /**
   * @property {String} tableRenderer
   */
  get tableRenderer(): string {
    return `table-renderer${this.isVerticalCollectionEnabled ? '-vertical-collection' : ''}`;
  }

  /**
   * @property {Object} request
   */
  @alias('args.model.firstObject.request')
  request!: RequestFragment;

  /**
   * @property {String} cellRendererPrefix - prefix for all cell renderer types
   */
  cellRendererPrefix = 'navi-cell-renderers/';

  /**
   * @property {Number} estimateHeight - estimated height in px of a single row
   */
  get estimateHeight(): number {
    return this.isVerticalCollectionEnabled ? 32 : 30;
  }

  /**
   * @property {Number} bufferSize - size of the buffer before and after the collection
   */
  bufferSize = 10;

  /**
   * Get next direction based on column type and current direction
   *
   * @method _getNextSortDirection
   * @private
   * @param {String} type - column type
   * @param {String} sortDirection - current sort direction
   * @returns {String} direction
   */
  _getNextSortDirection(type: ColumnFragment['type'], sortDirection: SortDirection) {
    let direction = NEXT_SORT_DIRECTION[sortDirection];

    // timeDimension will always be sorted
    if (type === 'timeDimension' && direction === 'none') {
      direction = 'desc';
    }

    return direction;
  }

  /**
   * @action headerClicked
   * sends sort action when timeDimension header is clicked
   * @param {Object} column object
   */
  @action
  headerClicked(column: TableColumn) {
    const { type } = column.fragment;
    if (type === 'timeDimension' || type === 'metric') {
      const sort = this.request.sorts.find(sort => sort.canonicalName === column.fragment.canonicalName);
      const sortDirection = (sort?.direction || 'none') as SortDirection;
      const direction = this._getNextSortDirection(type, sortDirection);
      //TODO Fetch from report action dispatcher service
      const actionType = direction === 'none' ? 'removeSort' : 'upsertSort';

      this.args.onUpdateReport(actionType, column.fragment, direction);
    }
  }

  /**
   * @action updateColumnOrder
   */
  @action
  updateColumnOrder(newColumnOrder: TableColumn[]) {
    this.args.onUpdateReport('updateColumnOrder', newColumnOrder);
  }

  /**
   * @action updateColumnDisplayName
   */
  @action
  updateColumnDisplayName(column: TableColumn, alias: string | undefined) {
    this.args.onUpdateReport('renameColumnFragment', column.fragment, alias);
  }
}
