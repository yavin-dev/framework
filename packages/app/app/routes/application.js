/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  /**
   * @property {Ember.Service}
   */
  @service bardMetadata;

  /**
   * @property {Ember.Service}
   */
  @service user;

  /**
   * @method model
   * @override
   * @returns {Ember.RSVP.Promise}
   */
  async model() {
    await Promise.all([this.user.findOrRegister(), this.bardMetadata.loadMetadata()]);
  }
}
