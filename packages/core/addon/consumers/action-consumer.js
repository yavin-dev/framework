/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
export default Ember.Object.extend(Ember.ActionHandler, {
  /**
   * @property {Object} actions - object of functions, keyed by name to
   *                              handle dispatched actions
   */
  actions: undefined
});
