/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * <DirNewButton />
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import FileTypes from 'navi-directory/utils/enums/file-types';
import { inject as service } from '@ember/service';
import { Registry as Services } from '@ember/service';

export default class DirNewButtonComponent extends Component {
  @service router!: Services['router'];

  /**
   * @property {Array} fileTypeNames - Names of file types in directory
   */
  fileTypeNames = FileTypes.getTypes();

  /**
   * @property {Object} fileTypes - Object containing file types icon class and route-link with the type name as keys
   */
  fileTypes = FileTypes.definitions;

  @action
  linkTo(route: string) {
    this.router.transitionTo(route);
  }
}
