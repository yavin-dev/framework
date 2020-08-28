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
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
//@ts-ignore
import { groupBy } from 'lodash-es';
import EmberArray from '@ember/array';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import NaviFormatterService from 'navi-data/services/navi-formatter';
import { TableColumn, TableColumnType } from 'navi-core/serializers/table';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

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

type UpdateAction = 'upsertSort' | 'removeSort' | 'updateColumn' | 'updateColumnOrder';
export type Args = {
  model: EmberArray<{ request: RequestFragment; response: ResponseRow[] }>;
  options: {
    columns: TableColumn[];
    showTotals?: {
      grandTotal?: boolean;
      subtotal?: string;
    };
  };
  isEditing?: boolean;
  onUpdateReport: (action: UpdateAction, ...params: unknown[]) => void;
};

export default class Table extends Component<Args> {
  @service naviMetadata!: NaviMetadataService;

  @service naviFormatter!: NaviFormatterService;

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
   * @method computeColumnTotal
   * Compute total for a metric column
   * Returns sum of values, may be overriden with your own logic
   *
   * @param {Array} data
   * @param {String} metricName
   * @param {Object} totalRow
   * @param {Object} column
   * @param {String} type - `grandTotal` || `subtotal`
   * @returns {*} sum
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
   * @method _computeTotal
   * Compute total for all metrics in the data
   *
   * @private
   * @param {Array} data
   * @param {String} type - `grandTotal` || `subtotal`
   * @returns {Object} totalRow
   */
  _computeTotal(data: ResponseRow[], type: TotalType) {
    const { columns, totalRows, rowsInResponse, selectedSubtotal } = this;
    const hasPartialData = totalRows > rowsInResponse;

    let hasTitle = false;
    let totalRow = columns.reduce((totRow: TotalRow, column) => {
      const { field, parameters } = column;
      const canonicalName = canonicalizeMetric({ metric: field, parameters: parameters });

      if (column.type === 'timeDimension' && !hasTitle) {
        totRow[canonicalName] = HEADER_TITLE[type];
        hasTitle = true;
      }

      //set subtotal dimension if subtotal row
      if (column.type === 'dimension' && canonicalName === selectedSubtotal && type === 'subtotal') {
        totRow[canonicalName] = data[0][canonicalName];
      }

      //if metric and not partial data compute totals
      if (column.type === 'metric' && column.attributes.canAggregateSubtotal !== false && !hasPartialData) {
        totRow[canonicalName] = this.computeColumnTotal(data, canonicalName, totRow, column, type);
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

    if (!groupingColumn) {
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
    let { selectedSubtotal: groupingColumn, rawData } = this;

    return groupBy(rawData, (row: ResponseRow) => row[groupingColumn]);
  }

  /**
   * @property {Object} tableData
   */
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
  get columns() {
    const columns = [...(this.args.options?.columns || [])];

    return columns;
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
  @alias('model.firstObject.request')
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
  _getNextSortDirection(type: TableColumnType, sortDirection: SortDirection) {
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
  headerClicked({ type, field, parameters }: TableColumn) {
    if (type === 'timeDimension' || type === 'metric') {
      const canonicalName = canonicalizeMetric({ metric: field, parameters });
      const sort = this.args.model.objectAt(0)?.request.sorts.find(sort => sort.canonicalName === canonicalName);
      const sortDirection = (sort?.direction || 'none') as SortDirection;
      const direction = this._getNextSortDirection(type, sortDirection);
      //TODO Fetch from report action dispatcher service
      const actionType = direction === 'none' ? 'removeSort' : 'upsertSort';

      this.args.onUpdateReport(actionType, canonicalName, direction);
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
  updateColumnDisplayName(column: TableColumn, displayName: string | undefined) {
    const newColumn: TableColumn = {
      ...column,
      attributes: {
        ...column.attributes,
        displayName
      }
    };
    this.args.onUpdateReport('updateColumn', newColumn);
  }
}
