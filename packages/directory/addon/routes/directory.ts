/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DirectoryRoute extends Route {
  /**
   * @property {Service} user
   */
  @service user: TODO;

  /**
   * @property {Object} queryParams
   * @override
   */
  queryParams = {
    filter: {
      refreshModel: true
    },
    type: {
      refreshModel: true
    },
    q: {
      replace: true
    },
    sortBy: {
      replace: true
    },
    sortDir: {
      replace: true
    }
  };

  /**
   * @method model
   * @override
   */
  model() {
    return this.user.getUser();
  }
}
