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
import { isEmpty } from '@ember/utils';
import FileTypes from 'navi-directory/utils/enums/file-types';

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
   * @property {Array} fileTypes
   */
  fileTypes: computed(function() {
    let types = FileTypes.getTypes();
    return [ 'all', ...types ];
  }),

  /**
   * @property {String} selectedFileType
   */
  selectedFileType: computed('typeFilter', function() {
    let selected = get(this, 'typeFilter');
    return isEmpty(selected) ? 'all' : selected;
  }),

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
      valuePath: 'name'
    }, {
      label: 'AUTHOR',
      valuePath: 'author'
    }, {
      label: 'LAST UPDATED DATE',
      valuePath: 'lastUpdatedDate'
    }];
  }),

  /**
   * @property {Object} table - Used by ember-light-table to create the table
   */
  table: computed('model', function() {
    return new Table(this.get('columns'), this.get('model'));
  }),

  actions: {
    /**
     * @action close
     * @param {Object} dropdown
     */
    close(dropdown) {
      dropdown.actions.close();
    },

    /**
     * @action filterByType
     * @param {String} type - query param value for type
     */
    filterByType(type) {
      let queryParam = type;
      if(type === 'all') {
        queryParam  = null;
      }

      this.get('updateQueryParams')({ type: queryParam });
    }
  }
});
