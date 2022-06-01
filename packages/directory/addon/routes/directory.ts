/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import DirectoryController from 'navi-directory/controllers/directory';
import type UserService from 'navi-core/services/user';

export default class DirectoryRoute extends Route {
  /**
   * @property {Service} user
   */
  @service declare user: UserService;

  declare controller: DirectoryController;

  /**
   * @property {Object} queryParams
   * @override
   */
  queryParams = {
    filter: {
      refreshModel: true,
    },
    type: {
      refreshModel: true,
    },
    q: {
      replace: true,
    },
    sortBy: {
      replace: true,
    },
    sortDir: {
      replace: true,
    },
  };

  /**
   * @method model
   * @override
   */
  model() {
    return this.user.getUser();
  }

  @action
  willTransition() {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const { controller } = this;
    if (controller.sidebarOpen) {
      controller.set('sidebarOpen', false);
    }
  }
}
