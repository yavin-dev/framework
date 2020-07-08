/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AdminUsersController extends Controller {
  /**
   * @property {boolean} isUserModalOpen
   */
  @tracked isUserModalOpen = false;

  /**
   * @property {Number} userCount
   */
  get userCount(): number {
    return this.model.users.length;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    users: AdminUsersController;
  }
}
