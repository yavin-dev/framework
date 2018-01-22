/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

const { get } = Ember;

export default Ember.Route.extend({
  /**
    * @property {Ember.Service}
    */
  bardMetadata: Ember.inject.service(),

  /**
    * @property {Ember.Service}
    */
  user: Ember.inject.service(),

  /**
    * @method model
    * @override
    * @returns {Ember.RSVP.Promise}
    */
  model() {
    return Ember.RSVP.hash({
      user: get(this, 'user').findOrRegister(),
      metadata: get(this, 'bardMetadata').loadMetadata()
    }).then(() => {
      return;
    });
  }
});
