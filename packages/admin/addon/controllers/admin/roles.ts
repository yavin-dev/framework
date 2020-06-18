/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class Roles extends Controller {
  /**
   * @property {Boolean} isAddUserModalOpen
   */
  @tracked isAddUserModalOpen = false;

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
    roles: Roles;
  }
}
