/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * @method redirect
   * @override
   */
  redirect() {
    let { id } = this.modelFor('dashboards.dashboard');
    this.replaceWith('dashboards.dashboard.view', id);
  },
});
