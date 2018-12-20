/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

export default Ember.Helper.extend({
  /**
   * @property {Service} userService
   */
  userService: Ember.inject.service('user'),

  /*
   * @method compute
   * @override
   */
  compute() {
    return Ember.get(this, 'userService').getUser();
  }
});
