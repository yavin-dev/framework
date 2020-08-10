/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  @service naviMetadata;

  @service user;

  /**
   * @method model
   * @override
   * @returns {Ember.RSVP.Promise}
   */
  async model() {
    await Promise.all([this.user.findOrRegister(), this.naviMetadata.loadMetadata()]);
  }
}
