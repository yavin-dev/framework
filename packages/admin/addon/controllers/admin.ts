/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

/**
 * @constant ADMIN_TAB_OPTIONS
 */
const ADMIN_TAB_OPTIONS = [
  {
    title: 'Manage Users',
    route: 'admin.roles'
  }
];

export default class AdminController extends Controller {
  /**
   * @property {Array} tabOptions
   */
  @tracked tabOptions = ADMIN_TAB_OPTIONS;

  /**
   * @property {boolean} isTabExpanded
   */
  @tracked isTabExpanded: boolean = true;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    admin: Admin;
  }
}
