/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class ApplicationRoute extends Route {
  @service naviMetadata;

  @service user;

  async model() {
    await this.user.findOrRegister();
  }
}
