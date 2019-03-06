/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/table
 *   model=model
 *   isEditing=isEditing
 *   options=options
 *   onUpdateReport=(action 'onUpdateReport')
 * }}
 */
import { readOnly, alias } from '@ember/object/computed';
import layout from '../../templates/components/navi-visualizations/table';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import { assign } from '@ember/polyfills';
import { A as arr } from '@ember/array';
import Component from '@ember/component';
import { isBlank } from '@ember/utils';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import { canonicalizeMetric, canonicalizeColumnAttributes } from 'navi-data/utils/metric';
import { getColumnDefaultName } from 'navi-core/helpers/default-column-name';
import { featureFlag } from 'navi-core/helpers/feature-flag';

const NEXT_SORT_DIRECTION = {
  none: 'desc',
  desc: 'asc',
  asc: 'none'
};

const HEADER_TITLE = {
  grandTotal: 'Grand Total',
  subtotal: 'Subtotal'
};

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-widget'],

  /**
   * @property {Service} bardMetadata
   */
  bardMetadata: service(),

  /*
   * @property {Boolean} occlusion - whether or not to incremental render
   */
  occlusion: true,

  /**
   * @property {String} selectedSubtotal
   */
  selectedSubtotal: readOnly('options.showTotals.subtotal'),

  /**
   * @property {Array} rawData - data from the WS
   */
  rawData: readOnly('model.0.response.rows'),

  /**
   * @property {Number} totalRows - total rows for the request
   */
  totalRows: readOnly('model.0.response.meta.pagination.numberOfResults'),

  /**
   * @property {Number} rowsInResponse - rows in response
   */
  rowsInResponse: alias('model.0.response.rows.length'),

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
  },

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
    let columns = get(this, 'columns'),
      hasPartialData = get(this, 'totalRows') > get(this, 'rowsInResponse');

    let totalRow = columns.reduce((totRow, column) => {
      let { name } = column.attributes;

      //if dateTime set type
      if (column.type === 'dateTime') {
        set(totRow, name, HEADER_TITLE[type]);
      }

      //set subtotal dimension if subtotal row
      if (name === get(this, 'selectedSubtotal') && type === 'subtotal') {
        let idField = `${name}|id`,
          descField = `${name}|desc`;

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
    set(totalRow, '__meta__', Object.assign({}, get(totalRow, '__meta__'), { isTotalRow: true }));

    //if partial data add indication to meta
    if (hasPartialData) {
      set(totalRow, '__meta__.hasPartialData', true);
    }

    return totalRow;
  },

  /**
   * @method _computeSubtotals
   * Compute subtotal for selected dimension in the data
   *
   * @private
   * @returns {Array} data with subtotal rows
   */
  _computeSubtotals() {
    let groupingColumn = get(this, 'selectedSubtotal');

    if (!groupingColumn) {
      return get(this, 'rawData');
    }

    let groupedData = get(this, 'groupedData'),
      dataWithSubtotals = Object.keys(groupedData).reduce((arr, group) => {
        let subTotalRow = this._computeTotal(groupedData[group], 'subtotal');
        return [...arr, ...groupedData[group], subTotalRow];
      }, []);

    return dataWithSubtotals;
  },

  /**
   * @method _hasCustomDisplayName
   * Determines if column has a custom display name
   *
   * @private
   * @returns {Boolean}
   */
  _hasCustomDisplayName(column) {
    if (isBlank(column.displayName)) {
      return false;
    }

    let defaultName = getColumnDefaultName(column, get(this, 'bardMetadata'));
    return column.displayName !== defaultName;
  },

  /**
   * @property {Object} groupedData - data grouped by grouping column specified in selectedSubtotal
   */
  groupedData: computed('selectedSubtotal', 'rawData', function() {
    let groupingColumn = get(this, 'selectedSubtotal'),
      rawData = get(this, 'rawData');

    if (groupingColumn !== 'dateTime') {
      groupingColumn = `${groupingColumn}|id`;
    }

    return groupBy(rawData, row => get(row, groupingColumn));
  }),

  /**
   * @property {Object} tableData
   */
  tableData: computed('rawData', 'columns', 'options.showTotals.{grandTotal,subtotal}', function() {
    let tableData = this._computeSubtotals(),
      rawData = get(this, 'rawData');

    if (!get(this, 'options.showTotals.grandTotal')) {
      return tableData;
    }

    return [...tableData, this._computeTotal(rawData, 'grandTotal')];
  }),

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

    let requestSorts = arr(get(request, 'sort')),
      requestMetricsAliasMap = arr(get(request, 'metrics')).reduce((map, metric) => {
        let alias = get(metric, 'parameters.as');
        if (alias) {
          map[alias] = metric;
        }
        return map;
      }, {});

    return requestSorts.map(sort => {
      let metric = requestMetricsAliasMap[get(sort, 'metric')];
      sort.metric = metric ? canonicalizeMetric(metric) : sort.metric;
      return sort;
    });
  },

  /**
   * @property {Object} columns
   */
  columns: computed('options.columns', 'request.sort', function() {
    let sorts = this._mapAlias(get(this, 'request')),
      columns = cloneDeep(get(this, 'options.columns') || []);

    return columns.map(column => {
      let { attributes, type } = column,
        canonicalName = type === 'dateTime' ? type : canonicalizeColumnAttributes(attributes),
        sort = arr(sorts).findBy('metric', canonicalName) || {},
        hasCustomDisplayName = this._hasCustomDisplayName(column),
        sortDirection;

      if (column.type === 'dateTime') {
        sortDirection = get(sort, 'direction') || 'desc';
      } else if (/^metric|threshold$/.test(type)) {
        sortDirection = get(sort, 'direction') || 'none';
      }

      return assign({}, column, {
        hasCustomDisplayName,
        sortDirection
      });
    });
  }),

  /**
   * @property {Boolean} isEditingMode
   */
  isEditingMode: computed('isEditing', function() {
    return featureFlag('enableTableEditing') && get(this, 'isEditing');
  }),

  /**
   * @property {Boolean} isVerticalCollectionEnabled
   */
  isVerticalCollectionEnabled: computed(function() {
    return featureFlag('enableVerticalCollectionTableIterator');
  }),

  /**
   * @property {String} tableRenderer
   */
  tableRenderer: computed('isVerticalCollectionEnabled', function() {
    return `table-renderer${get(this, 'isVerticalCollectionEnabled') ? '-vertical-collection' : ''}`;
  }),

  /**
   * @property {Object} request
   */
  request: alias('model.0.request'),

  /**
   * @property {String} cellRendererPrefix - prefix for all cell renderer types
   */
  cellRendererPrefix: 'cell-renderers/',

  /**
   * @property {Number} estimateHeight - estimated height in px of a single row
   */
  estimateHeight: computed('isVerticalCollectionEnabled', function() {
    return get(this, 'isVerticalCollectionEnabled') ? 32 : 30;
  }),

  /**
   * @property {Number} bufferSize - size of the buffer before and after the collection
   */
  bufferSize: 10,

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
  },

  actions: {
    /**
     * @action headerClicked
     * sends sort action when dateTime header is clicked
     * @param {Object} column object
     */
    headerClicked({ attributes, type, sortDirection }) {
      if (/^threshold|dateTime|metric$/.test(type)) {
        let direction = this._getNextSortDirection(type, sortDirection),
          //TODO Fetch from report action dispatcher service
          actionType = direction === 'none' ? 'removeSort' : 'upsertSort',
          canonicalName = type === 'dateTime' ? type : canonicalizeColumnAttributes(attributes);

        this.onUpdateReport(actionType, canonicalName, direction);
      }
    },

    /**
     * @action updateColumnOrder
     */
    updateColumnOrder(newColumnOrder) {
      this.onUpdateReport('updateColumnOrder', newColumnOrder);
    },

    /**
     * @action updateColumnDisplayName
     */
    updateColumnDisplayName(column, displayName) {
      run.scheduleOnce('afterRender', () => {
        this.onUpdateReport(
          'updateColumn',
          assign({}, column, {
            displayName
          })
        );
      });
    }
  }
});
