/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * @method redirect
   * @override
   */
  redirect(model, transition) {
    let { id } = this.modelFor('dashboards-print.dashboards.dashboard');
    this.replaceWith('dashboards-print.dashboards.dashboard.view', id, { queryParams: transition.to?.queryParams });
  }
});
