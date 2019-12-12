/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirTableFilter
 *    @selectedType={{type}}
 *    @updateQueryParams={{action 'updateQueryParams'}}
 *  />
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-table-filter';
import { computed, action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import FileTypes from 'navi-directory/utils/enums/file-types';
import { layout as templateLayout } from '@ember-decorators/component';

@templateLayout(layout)
class DirTableFilter extends Component {
  /**
   * @property {Array} fileTypes
   */
  @computed
  get fileTypes() {
    return ['all', ...FileTypes.getTypes()];
  }

  /**
   * @property {String} selectedFileType
   */
  @computed('selectedType')
  get selectedFileType() {
    const { selectedType } = this;
    return isEmpty(selectedType) ? 'all' : selectedType;
  }

  /**
   * @action close
   * @param {Object} dropdown
   */
  @action
  close(dropdown) {
    dropdown.actions.close();
  }

  /**
   * @action filterByType
   * @param {String} type - query param value for type
   */
  @action
  filterByType(type) {
    let queryParam = type;
    if (type === 'all') {
      queryParam = null;
    }

    this.updateQueryParams({ type: queryParam });
  }
}

export default DirTableFilter;
