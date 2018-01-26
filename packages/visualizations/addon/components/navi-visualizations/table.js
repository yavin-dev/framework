/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/table
 *   model=model
 *   options=options
 *   onUpdateReport=(action 'onUpdateReport')
 * }}
 */

import Ember from 'ember';
import layout from '../../templates/components/navi-visualizations/table';
import { formatItemDimension } from '../../helpers/mixed-height-layout';
import groupBy from 'lodash/groupBy';

const { $, A:arr, computed, get, set, typeOf } = Ember;

const NEXT_SORT_DIRECTION = {
  'none': 'desc',
  'desc': 'asc',
  'asc': 'none',
};

const HEADER_TITLE = {
  'grandTotal': 'Grand Total',
  'subtotal': 'Subtotal'
};

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: [ 'table-widget' ],

  /**
   * @property {String} selectedSubtotal
   */
  selectedSubtotal: computed.readOnly('options.showTotals.subtotal'),

  /**
   * @property {Array} rawData - data from the WS
   */
  rawData: computed.readOnly('model.firstObject.response.rows'),

  /**
   * @property {Number} totalRows - total rows for the request
   */
  totalRows: computed.readOnly('model.firstObject.response.meta.pagination.numberOfResults'),

  /**
   * @property {Number} rowsInResponse - rows in response
   */
  rowsInResponse: computed.alias('model.firstObject.response.rows.length'),

  /**
   * @method _computeTotal
   * Compute total for all metrics in the data
   *
   * @private
   * @param {Array} data
   * @param {String} type
   * @returns {Object} totalRow
   */
  _computeTotal(data, type) {
    let columns = get(this, 'columns');

    let totalRow = columns.reduce((totRow, column) => {
      //if dateTime set type
      if(column.type === 'dateTime'){
        set(totRow, column.field, HEADER_TITLE[type]);
      }

      //set subtotal dimension if subtotal row
      if(column.field === get(this, 'selectedSubtotal') && type === 'subtotal'){
        let idField = `${column.field}|id`,
            descField = `${column.field}|desc`;

        set(totRow, idField, data[0][idField]);
        set(totRow, descField, data[0][descField]);
      }

      //add meta to indicate totalRow
      set(totRow, '__meta__', { isTotalRow: true });

      //if partial data do not compute metric totals
      if(get(this, 'totalRows') > get(this, 'rowsInResponse')){
        set(totRow, '__meta__.hasPartialData', true);
        return totRow;
      }

      //if metric find sum
      if(column.type === 'metric'){
        totRow[column.field] = data.reduce((sum, row) => {
          if(typeOf(row[column.field]) === 'number'){
            return sum + row[column.field];
          }
          return sum;
        }, 0);
      }

      return totRow;
    }, {});

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

    if(!groupingColumn) { return get(this, 'rawData'); }

    let groupedData = get(this, 'groupedData'),
        dataWithSubtotals = Object.keys(groupedData).reduce((arr, group) => {
          let subTotalRow = this._computeTotal(groupedData[group], 'subtotal');
          return [ ...arr, ...groupedData[group], subTotalRow ];
        }, []);

    return dataWithSubtotals;
  },

  /**
   * @property {Object} groupedData - data grouped by grouping column specified in selectedSubtotal
   */
  groupedData: computed('selectedSubtotal', 'rawData', function() {
    let groupingColumn = get(this, 'selectedSubtotal'),
        rawData = get(this, 'rawData');

    if(groupingColumn !== 'dateTime'){
      groupingColumn = `${groupingColumn}|id`;
    }

    return groupBy(rawData,
      row => get(row, groupingColumn)
    );
  }),

  /**
   * @property {Object} tableData
   */
  tableData: computed('rawData', 'columns', 'options.showTotals.{grandTotal,subtotal}', function() {
    let tableData = this._computeSubtotals();

    if(!get(this, 'options.showTotals.grandTotal')){
      return tableData;
    }

    return [ ...tableData, this._computeTotal(tableData, 'grandTotal') ];
  }),

  /**
   * @property {Object} columns
   */
  columns: computed('options.columns', 'request.sort', function() {
    let sorts = arr(get(this, 'request.sort')),
        columns = $.extend(true, [], get(this, 'options.columns'));

    return columns.map( column => {
      let sort =  sorts.findBy('metric', column.field) || {};
      let sortDirection;

      if(column.type === 'dateTime'){
        sortDirection =  get(sort, 'direction') || 'desc';
      } else if (/^metric|threshold$/.test(column.type)) {
        sortDirection =  get(sort, 'direction') || 'none';
      }

      Ember.setProperties(column, {
        sortDirection
      });

      return column;
    });

  }),

  /**
   * @property {Object} request
   */
  request: computed.alias('model.firstObject.request'),

  /**
   * @property {String} cellRendererPrefix - prefix for all cell renderer types
   */
  cellRendererPrefix: 'cell-renderers/',

  /**
   * @property {Number} rowHeight - height in px of a single item
   */
  rowHeight: 30,

  /**
   * @property {Array} rowDimensions - indicates the dimensions for each row of data
   */
  rowDimensions: computed('tableData', 'expandedIdx', function() {
    let rowDimension = formatItemDimension(get(this, 'rowHeight'));

    //Create a set of row dimensions for each row of data
    let rowDimensions =  new Array(get(this, 'tableData.length'));
    for(let i = 0; i < rowDimensions.length ; i++) {
      rowDimensions[i] = rowDimension;
    }

    return rowDimensions;
  }),

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
    headerClicked({ field, type, sortDirection }) {
      if(/^threshold|dateTime|metric$/.test(type)) {
        let direction = this._getNextSortDirection(type, sortDirection),
            //TODO Fetch from report action dispatcher service
            actionType = direction === 'none' ? 'removeSort' : 'upsertSort';

        this.attrs.onUpdateReport(actionType, field, direction);
      }
    },

    /**
     * @action updateColumnOrder
     */
    updateColumnOrder(newColumnOrder) {
      this.attrs.onUpdateReport(
        'updateColumnOrder',
        newColumnOrder
      );
    }
  }
});
