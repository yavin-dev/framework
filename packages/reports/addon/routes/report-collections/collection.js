/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

export default Ember.Route.extend({
  user: Ember.inject.service(),

  /**
   * Fetches the current user, then loads a list of reports under the collectionId
   * @param collectionId
   * @returns {*|Promise|Promise.<TResult>}
   */
  model({collectionId}) {
    return Ember.get(this, 'user').findOrRegister().then(() => this.get('store').findRecord('reportCollection', collectionId));
  }
});
