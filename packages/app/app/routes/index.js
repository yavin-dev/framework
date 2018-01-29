/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * TODO: Remove index route once we have a Nav-bar and/or landing page
 */
import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    this.transitionTo('customReports');
  }
});
