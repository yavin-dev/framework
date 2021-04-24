/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import type UserService from 'navi-core/services/user';

export default class GetUserHelper extends Helper {
  @service('user') declare userService: UserService;

  compute() {
    return this.userService.getUser();
  }
}
