/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  /**
   * @property { Service } user
   */
  user: inject(),

  /**
   * @property {Object} queryParams
   * @override
   */
  queryParams: {
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
  },

  /**
   * @method model
   * @override
   */
  model() {
    return get(this, 'user').getUser();
  },

  actions: {
    /**
     * @action updateQueryParams - update to the new query params
     * @param {Object} queryParams
     */
    updateQueryParams(queryParams) {
      this.transitionTo({ queryParams });
    }
  }
});
