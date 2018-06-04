/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { hash } from 'rsvp';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * @property {Ember.Service}
   */
  bardMetadata: service(),

  /**
   * @property {Ember.Service}
   */
  user: service(),

  /**
   * @method model
   * @override
   * @returns {Ember.RSVP.Promise}
   */
  model() {
    return hash({
      user: this.user.findOrRegister(),
      metadata: this.bardMetadata.loadMetadata()
    }).then(() => {
      return;
    });
  }
});
