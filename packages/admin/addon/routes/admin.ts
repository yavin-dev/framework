/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type UserService from 'navi-core/services/user';

export default class AdminRoute extends Route {
  @service
  declare user: UserService;

  model() {
    return this.user.getUser();
  }
}
