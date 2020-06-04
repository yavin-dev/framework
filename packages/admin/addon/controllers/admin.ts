/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

const ADMIN_TAB_OPTIONS = [
  {
    title: 'Manage Users',
    route: 'admin.roles'
  }
];

export default class Admin extends Controller {
  @tracked tabOptions = ADMIN_TAB_OPTIONS;
  @tracked isTabExpanded = true;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    admin: Admin;
  }
}
