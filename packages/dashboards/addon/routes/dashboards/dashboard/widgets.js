/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';

export default Ember.Route.extend({
  /**
   * @method model
   * @returns {Promise} Promise that resolves to a DS.RecordArray of Widgets
   */
  model() {
    return this.modelFor('dashboards.dashboard').get('widgets');
  }
});
