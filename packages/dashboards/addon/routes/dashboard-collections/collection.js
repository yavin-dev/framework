/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';

export default Route.extend({
  /**
   * @method model
   * @override
   *
   * Makes an ajax request to retrieve relevant dashbords in the collection
   */
  model({ collection_id }) {
    return this.store.find('dashboard-collection', collection_id);
  }
});
