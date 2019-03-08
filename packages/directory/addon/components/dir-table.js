/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{dir-table
 *   items=items
 *   isLoading=isLoading
 *   searchQuery=searchQuery
 *   sortBy=sortBy
 *   sortDir=sortDir
 *   onColumnClick=(action 'onColumnClick')
 * }}
 */
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import layout from '../templates/components/dir-table';
import Table from 'ember-light-table';
import Moment from 'moment';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName
   */
  tagName: '',

  //TODO replace with `is-empty` helper from ember-truth-helpers once that is released
  /**
   * @property {Boolean} isSearching
   */
  isSearching: computed('searchQuery', function() {
    return !isEmpty(this.searchQuery);
  }),

  /**
   * @property {Array} model - Used by ember-light-table to create rows
   */
  model: computed('items', function() {
    let items = this.items || [];
    return items.map(item => ({
      model: item,
      lastUpdatedDate: Moment(get(item, 'updatedOn')).format('MM/DD/YYYY -  hh:mm:ss a')
    }));
  }),

  /**
   * @property {Array} columns - Used by ember-light-table to define each column
   */
  columns: computed(function() {
    return [
      {
        label: 'NAME',
        valuePath: 'model',
        sortByKey: 'title',
        hideable: false,
        draggable: false,
        classNames: 'dir-table__header-cell dir-table__header-cell--name',
        cellComponent: 'dir-item-name-cell',
        cellClassNames: 'dir-table__cell dir-table__cell--name'
      },
      {
        label: '',
        valuePath: 'model',
        sortable: false,
        hideable: false,
        draggable: false,
        classNames: 'dir-table__header-cell dir-table__header-cell--actions',
        cellComponent: 'dir-asset-row-actions',
        cellClassNames: 'dir-table__cell dir-table__cell--actions'
      },
      {
        label: 'AUTHOR',
        valuePath: 'model.author.id',
        sortByKey: 'author',
        hideable: false,
        draggable: false,
        width: '165px',
        classNames: 'dir-table__header-cell',
        cellClassNames: 'dir-table__cell dir-table__cell--author',
        breakpoints: ['desktop', 'jumbo']
      },
      {
        label: 'LAST UPDATED DATE',
        valuePath: 'lastUpdatedDate',
        sortByKey: 'updatedOn',
        sortDescFirst: true,
        hideable: false,
        draggable: false,
        width: '200px',
        classNames: 'dir-table__header-cell',
        cellClassNames: 'dir-table__cell dir-table__cell--lastUpdatedDate',
        breakpoints: ['desktop', 'jumbo']
      }
    ];
  }),

  /**
   * @property {Object} table - Used by ember-light-table to create the table
   */
  table: computed('model', function() {
    let table = new Table(this.columns, this.model, {
      rowOptions: {
        classNames: 'dir-table__row'
      }
    });

    let { sortBy } = this;
    if (!isEmpty(sortBy)) {
      let sortColumn = table.get('allColumns').findBy('sortByKey', sortBy);

      if (sortColumn) {
        sortColumn.setProperties({
          sorted: true,
          ascending: this.sortDir !== 'desc'
        });
      }
    }

    return table;
  }),

  /**
   * @method _getNextSort
   * Get next sort based on column and current sortBy
   *
   * @private
   * @param {Object} column
   * @returns {Object} sort column key and direction
   */
  _getNextSort(column) {
    let { sortBy } = this,
      nextSortBy = get(column, 'sortByKey'),
      nextSortDir;

    if (sortBy === nextSortBy) {
      nextSortDir = get(column, 'ascending') ? 'asc' : 'desc';
    } else {
      nextSortDir = get(column, 'sortDescFirst') ? 'desc' : 'asc';
    }

    return {
      sortBy: nextSortBy,
      sortDir: nextSortDir
    };
  },

  actions: {
    /**
     * @action onColumnClick
     * @param {Object} column
     */
    onColumnClick(column) {
      if (column.sorted) {
        let onColumnClick = this.onColumnClick;

        if (typeof onColumnClick === 'function') {
          onColumnClick(this._getNextSort(column));
        }
      }
    }
  }
});
