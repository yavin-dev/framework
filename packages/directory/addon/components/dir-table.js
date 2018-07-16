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
import { computed, get, getWithDefault } from '@ember/object';
import layout from '../templates/components/dir-table';
import Table from 'ember-light-table';
import Moment from 'moment';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName
   */
  tagName: '',

  /**
   * @property {Array} model - Used by ember-light-table to create rows
   */
  model: computed('items', function() {
    return getWithDefault(this, 'items', []).map(item => {
      let type = get(item.serialize().data, 'type');

      return {
        type,
        id: get(item, 'id'),
        name: get(item, 'title'),
        lastUpdatedDate: Moment(get(item, 'updatedOn')).format('MM/DD/YYYY -  hh:mm:ss a z'),
        author: get(item, 'author.id')
      };
    });
  }),

  /**
   * @property {Array} columns - Used by ember-light-table to define each column
   */
  columns: computed(function() {
    return [{
      label: 'NAME',
      valuePath: 'name',
      width: '300px',
    }, {
      label: 'AUTHOR',
      valuePath: 'author',
      width: '250px'
    }, {
      label: 'LAST UPDATED DATE',
      valuePath: 'lastUpdatedDate',
      width: '450px'
    }];
  }),

  /**
   * @property {Object} table - Used by ember-light-table to create the table
   */
  table: computed('model', function() {
    return new Table(this.get('columns'), this.get('model'));
  })
});
