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
 * }}
 */
import { readOnly, alias } from '@ember/object/computed';
import layout from '../../templates/components/navi-visualizations/table';
import { computed, set, action } from '@ember/object';
import { inject as service } from '@ember/service';
import { assign } from '@ember/polyfills';
import { A as arr } from '@ember/array';
import Component from '@ember/component';
import { isBlank } from '@ember/utils';
import { cloneDeep, groupBy } from 'lodash-es';
import { canonicalizeMetric, canonicalizeColumnAttributes } from 'navi-data/utils/metric';
import { getColumnDefaultName } from 'navi-core/helpers/default-column-name';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { layout as templateLayout, classNames } from '@ember-decorators/component';

const NEXT_SORT_DIRECTION = {
  none: 'desc',
  desc: 'asc',
  asc: 'none'
};

const HEADER_TITLE = {
  grandTotal: 'Grand Total',
  subtotal: 'Subtotal'
};

@templateLayout(layout)
@classNames('table-widget')
class Table extends Component {
  /**
   * @property {Service} bardMetadata
   */
  @service bardMetadata;

  /**
   * @property {Service} naviFormatter
   */
  @service naviFormatter;

  /*
   * @property {Boolean} occlusion - whether or not to incremental render
   */
  occlusion = true;

  /**
   * @property {String} selectedSubtotal
   */
  @readOnly('options.showTotals.subtotal')
  selectedSubtotal;

  /**
   * @property {Array} rawData - data from the WS
   */
  @readOnly('model.firstObject.response.rows')
  rawData;

  /**
   * @property {Number} totalRows - total rows for the request
   */
  @readOnly('model.firstObject.response.meta.pagination.numberOfResults')
  totalRows;

  /**
   * @property {Number} rowsInResponse - rows in response
   */
  @alias('model.firstObject.response.rows.length')
  rowsInResponse;

  /**
   * @property {Boolean} isDraggingDisabled - Determines whether table columns can be reordered
   */
  get isDraggingDisabled() {
    return this.element.parentElement.classList.contains('navi-widget__content');
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
  computeColumnTotal(data, metricName /*, totalRow, column, type*/) {
    return data.reduce((sum, row) => {
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
  _computeTotal(data, type) {
    const { columns, totalRows, rowsInResponse, selectedSubtotal } = this;
    const hasPartialData = totalRows > rowsInResponse;

    let totalRow = columns.reduce((totRow, column) => {
      let { name: id } = column.attributes;

      //if dateTime set type
      if (column.type === 'dateTime') {
        set(totRow, id, HEADER_TITLE[type]);
      }

      //set subtotal dimension if subtotal row
      if (id === selectedSubtotal && type === 'subtotal') {
        let idField = `${id}|id`,
          descField = `${id}|desc`;

        set(totRow, idField, data[0][idField]);
        set(totRow, descField, data[0][descField]);
      }

      //if metric and not partial data compute totals
      if (column.type === 'metric' && !hasPartialData) {
        let metricName = canonicalizeColumnAttributes(column.attributes);
        totRow[metricName] = this.computeColumnTotal(data, metricName, totRow, column, type);
      }

      return totRow;
    }, {});

    //add totalRow indication to meta
    set(totalRow, '__meta__', Object.assign({}, totalRow.__meta__, { isTotalRow: true }));

    //if partial data add indication to meta
    if (hasPartialData) {
      set(totalRow, '__meta__.hasPartialData', true);
    }

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
   * @method _hasCustomDisplayName
   * Determines if column has a custom display name
   *
   * @private
   * @param {Object} column - column object
   * @param {String} namespace - metadata namespace
   * @returns {Boolean}
   */
  _hasCustomDisplayName(column, namespace) {
    if (isBlank(column.displayName)) {
      return false;
    }

    const defaultName = getColumnDefaultName(column, this.bardMetadata, this.naviFormatter, namespace);
    return column.displayName !== defaultName;
  }

  /**
   * @property {Object} groupedData - data grouped by grouping column specified in selectedSubtotal
   */
  @computed('selectedSubtotal', 'rawData')
  get groupedData() {
    const { selectedSubtotal: groupingColumn, rawData } = this;

    if (groupingColumn !== 'dateTime') {
      groupingColumn = `${groupingColumn}|id`;
    }

    return groupBy(rawData, row => row[groupingColumn]);
  }

  /**
   * @property {Object} tableData
   */
  @computed('rawData', 'columns', 'options.showTotals.{grandTotal,subtotal}')
  get tableData() {
    let tableData = this._computeSubtotals(),
      rawData = this.rawData;

    if (!this.options?.showTotals?.grandTotal) {
      return tableData;
    }

    return [...tableData, this._computeTotal(rawData, 'grandTotal')];
  }

  /**
   * @method _mapAlias
   *
   * Maps the alias in sort to canonical metric name
   * @param {Object} request - serialized request object
   * @returns {Array} sorts with canonical names as metric
   */
  _mapAlias(request) {
    if (!request) {
      return arr([]);
    }

    const requestSorts = arr(request.sort),
      requestMetricsAliasMap = arr(request.metrics).reduce((map, metric) => {
        const alias = metric.parameters?.as;
        if (alias) {
          map[alias] = metric;
        }
        return map;
      }, {});

    return requestSorts.map(sort => {
      const metric = requestMetricsAliasMap[sort.metric];
      sort.metric = metric ? canonicalizeMetric(metric) : sort.metric;
      return sort;
    });
  }

  /**
   * @property {Object} columns
   */
  @computed('options.columns', 'request.{sort,dataSource}')
  get columns() {
    const sorts = this._mapAlias(this.request),
      columns = cloneDeep(this.options?.columns || []);

    return columns.map(column => {
      let { attributes, type } = column,
        canonicalName = type === 'dateTime' ? type : canonicalizeColumnAttributes(attributes),
        sort = arr(sorts).findBy('metric', canonicalName) || {},
        hasCustomDisplayName = this._hasCustomDisplayName(column, this.request.dataSource),
        sortDirection;

      if (column.type === 'dateTime') {
        sortDirection = sort.direction || 'desc';
      } else if (/^metric|threshold$/.test(type)) {
        sortDirection = sort.direction || 'none';
      }

      return assign({}, column, {
        hasCustomDisplayName,
        sortDirection
      });
    });
  }

  /**
   * @property {Boolean} isEditingMode
   */
  @computed('isEditing')
  get isEditingMode() {
    return featureFlag('enableTableEditing') && this.isEditing;
  }

  /**
   * @property {Boolean} isVerticalCollectionEnabled
   */
  @computed
  get isVerticalCollectionEnabled() {
    return featureFlag('enableVerticalCollectionTableIterator');
  }

  /**
   * @property {String} tableRenderer
   */
  @computed('isVerticalCollectionEnabled')
  get tableRenderer() {
    return `table-renderer${this.isVerticalCollectionEnabled ? '-vertical-collection' : ''}`;
  }

  /**
   * @property {Object} request
   */
  @alias('model.firstObject.request')
  request;

  /**
   * @property {String} cellRendererPrefix - prefix for all cell renderer types
   */
  cellRendererPrefix = 'navi-cell-renderers/';

  /**
   * @property {Number} estimateHeight - estimated height in px of a single row
   */
  @computed('isVerticalCollectionEnabled')
  get estimateHeight() {
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
  _getNextSortDirection(type, sortDirection) {
    let direction = NEXT_SORT_DIRECTION[sortDirection];

    // dateTime will always be sorted
    if (type === 'dateTime' && direction === 'none') {
      direction = 'desc';
    }

    return direction;
  }

  /**
   * @action headerClicked
   * sends sort action when dateTime header is clicked
   * @param {Object} column object
   */
  @action
  headerClicked({ attributes, type, sortDirection }) {
    if (/^threshold|dateTime|metric$/.test(type)) {
      let direction = this._getNextSortDirection(type, sortDirection),
        //TODO Fetch from report action dispatcher service
        actionType = direction === 'none' ? 'removeSort' : 'upsertSort',
        canonicalName = type === 'dateTime' ? type : canonicalizeColumnAttributes(attributes);

      this.onUpdateReport(actionType, canonicalName, direction);
    }
  }

  /**
   * @action updateColumnOrder
   */
  @action
  updateColumnOrder(newColumnOrder) {
    this.onUpdateReport('updateColumnOrder', newColumnOrder);
  }

  /**
   * @action updateColumnDisplayName
   */
  @action
  updateColumnDisplayName(column, displayName) {
    this.onUpdateReport('updateColumn', assign({}, column, { displayName }));
  }
}

export default Table;
