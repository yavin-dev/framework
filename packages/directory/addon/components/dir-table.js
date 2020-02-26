/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirTable
 *   @items={{@items}}
 *   @isLoading={{@isLoading}}
 *   @searchQuery={{@searchQuery}}
 *   @sortBy={{@sortBy}}
 *   @sortDir={{@sortDir}}
 *   @onColumnClick={{this.onColumnClick}}
 * />
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import Table from 'ember-light-table';
import moment from 'moment';
import { isEmpty } from '@ember/utils';

export default class DirTableComponent extends Component {
  //TODO replace with `is-empty` helper from ember-truth-helpers once that is released
  /**
   * @property {Boolean} isSearching
   */
  get isSearching() {
    return !isEmpty(this.args.searchQuery);
  }

  /**
   * @property {Array} model - Used by ember-light-table to create rows
   */
  get model() {
    const items = this.args.items || [];
    return items.map(item => ({
      model: item,
      lastUpdatedDate: moment(item.updatedOn).format('MM/DD/YYYY -  hh:mm:ss a')
    }));
  }

  /**
   * @property {Array} columns - Used by ember-light-table to define each column
   */
  columns = [
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

  /**
   * @property {Object} table - Used by ember-light-table to create the table
   */
  get table() {
    const table = Table.create({
      columns: this.columns,
      rows: this.model,
      rowOptions: {
        classNames: 'dir-table__row'
      }
    });

    const { sortBy, sortDir } = this.args;
    if (!isEmpty(sortBy)) {
      const sortColumn = table.get('allColumns').findBy('sortByKey', sortBy);

      if (sortColumn) {
        sortColumn.setProperties({
          sorted: true,
          ascending: sortDir !== 'desc'
        });
      }
    }

    return table;
  }

  /**
   * @method _getNextSort
   * Get next sort based on column and current sortBy
   *
   * @private
   * @param {Object} column
   * @returns {Object} sort column key and direction
   */
  _getNextSort(column) {
    const { sortBy } = this.args;
    const nextSortBy = column.sortByKey;

    let nextSortDir;
    if (sortBy === nextSortBy) {
      nextSortDir = column.ascending ? 'asc' : 'desc';
    } else {
      nextSortDir = column.sortDescFirst ? 'desc' : 'asc';
    }

    return {
      sortBy: nextSortBy,
      sortDir: nextSortDir
    };
  }

  /**
   * @action onColumnClick
   * @param {Object} column
   */
  @action
  onColumnClick(column) {
    if (column.sorted) {
      this.args.onColumnClick?.(this._getNextSort(column));
    }
  }
}
