/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

export default Ember.Helper.extend({
  store: Ember.inject.service(),

  /**
   * @method compute
   * @param {String} id - widget id
   * @returns {DS.Model} widget model
   */
  compute([id]) {
    return this.get('store').peekRecord('dashboard-widget', id);
  }
});
