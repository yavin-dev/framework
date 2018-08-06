/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{dir-table-filter
 *    selectedType=type
 *    updateQueryParams=(action 'updateQueryParams')
 *  }}
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-table-filter';
import { computed, get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import FileTypes from 'navi-directory/utils/enums/file-types';

export default Component.extend({
  layout,

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
  selectedFileType: computed('selectedType', function() {
    let selected = get(this, 'selectedType');
    return isEmpty(selected) ? 'all' : selected;
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
