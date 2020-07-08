/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
// @ts-ignore
import type StoreService from '@ember-data/store';

export default class AdminUsersRoute extends Route {
  /**
   * @property {Service} store;
   */
  @service store!: StoreService;

  /**
   * @method model
   * @override
   */
  async model() {
    const users = await this.store.findAll('user');

    return { users };
  }
}
