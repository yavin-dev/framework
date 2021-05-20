/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class Collection extends Route {
  @service user;

  /**
   * Fetches the current user, then loads a list of reports under the collectionId
   * @param collectionId
   * @returns {*|Promise|Promise.<TResult>}
   */
  model({ collection_id }) {
    return this.user.findOrRegister().then(() => this.store.findRecord('reportCollection', collection_id));
  }
}
