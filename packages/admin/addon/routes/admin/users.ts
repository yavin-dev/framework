/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
// @ts-ignore
import StoreService from '@ember-data/store';
import { hash } from 'rsvp';

export default class AdminUsersRoute extends Route {
  /**
   * @property {Service} store;
   */
  @service store!: StoreService;

  @service user!: TODO;

  /**
   * @method model
   * @override
   */
  async model() {
    const userIds = await this.store.findAll('user');
    const userModels = await Promise.all(userIds.content.map((user: { id: string }) => this.user.findUser(user.id)));
    return { users: userModels };
  }
}
