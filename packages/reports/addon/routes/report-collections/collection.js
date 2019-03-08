/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { get } from '@ember/object';

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  user: service(),

  /**
   * Fetches the current user, then loads a list of reports under the collectionId
   * @param collectionId
   * @returns {*|Promise|Promise.<TResult>}
   */
  model({ collection_id }) {
    return get(this, 'user')
      .findOrRegister()
      .then(() => this.get('store').findRecord('reportCollection', collection_id));
  }
});
