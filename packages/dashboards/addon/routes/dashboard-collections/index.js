/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  /**
   * @method model
   * @override
   * @returns {Object} - with an array of dashboard Collection models
   */
  model(){
    return this.store.findAll('dashboardCollection');
  }
});
