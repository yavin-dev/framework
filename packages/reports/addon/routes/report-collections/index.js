/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * Lists global report collections
   * @returns {*|Promise}
   */
  model() {
    return this.get('store').findAll('reportCollection');
  }
});
