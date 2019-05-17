/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * @method model
   * @returns {Promise} Promise that resolves to a DS.RecordArray of Widgets
   */
  model() {
    return this.modelFor('dashboards.dashboard').get('widgets');
  }
});
