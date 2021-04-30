/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';

export default class DashboardCollectionsCollectionRoute extends Route {
  /**
   * Makes an ajax request to retrieve relevant dashbords in the collection
   */
  model({ collection_id }: { collection_id: string }) {
    return this.store.findRecord('dashboard-collection', collection_id);
  }
}
