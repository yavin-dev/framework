/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AdminUsersController extends Controller {
  /**
   * @property {boolean} isUserModalOpen
   */
  @tracked isAddUserModalOpen = false;

  /**
   * @property {Number} userCount
   */
  get userCount(): number {
    return this.model.users.length;
  }

  /**
   * @method addUser
   */
  @action
  addUser(): void {
    this.isAddUserModalOpen = false;
    // TODO add user method
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'admin/users': AdminUsersController;
  }
}
