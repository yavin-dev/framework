/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirTableFilter
 *    @selectedType={{this.type}}
 *    @updateQueryParams={{this.updateQueryParams}}
 *  />
 */
import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import FileTypes from 'navi-directory/utils/enums/file-types';

export default class DirTableFilterComponent extends Component {
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
  @computed('args.selectedType')
  get selectedFileType() {
    const { selectedType } = this.args;
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

    this.args.updateQueryParams({ type: queryParam });
  }
}
