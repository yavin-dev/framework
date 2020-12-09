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
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import FileTypes from 'navi-directory/utils/enums/file-types';

interface DirTableFilterComponentArgs {
  selectedType: TODO<'all' | 'reports' | 'dashboards'>;
  updateQueryParams: (queryParams: object) => void;
}

export default class DirTableFilterComponent extends Component<DirTableFilterComponentArgs> {
  /**
   * @property {Array} fileTypes
   */
  get fileTypes() {
    return ['all', ...FileTypes.getTypes()];
  }

  /**
   * @property {String} selectedFileType
   */
  get selectedFileType() {
    const { selectedType } = this.args;
    return isEmpty(selectedType) ? 'all' : selectedType;
  }

  /**
   * @action filterByType
   * @param {String} type - query param value for type
   */
  @action
  filterByType(type: string) {
    let queryParam;
    if (type === 'all') {
      queryParam = null;
    } else {
      queryParam = type;
    }

    this.args.updateQueryParams?.({ type: queryParam });
  }
}
