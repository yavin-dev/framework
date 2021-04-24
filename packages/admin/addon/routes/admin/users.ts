/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type StoreService from '@ember-data/store';
import 'navi-core/models/user';

export default class AdminUsersRoute extends Route {
  @service
  declare store: StoreService;

  async model() {
    const users = await this.store.findAll('user');

    return { users };
  }
}
