/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{dir-table
 *   items=items
 *   isSearching=isSearching
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
    return !isEmpty(get(this, 'searchQuery'));
  }),

  /**
   * @property {Array} model - Used by ember-light-table to create rows
   */
  model: computed('items', function() {
    let items = get(this, 'items') || [];
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
        sortable: false,
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
        sortable: false,
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
        sortable: false,
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
    return new Table(this.get('columns'), this.get('model'), {
      rowOptions: {
        classNames: 'dir-table__row'
      }
    });
  })
});
