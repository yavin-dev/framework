/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';

export default Ember.Route.extend({
  /**
   * @method model
   * @override
   *
   * Makes an ajax request to retrieve relevant dashbords in the collection
   */
  model({ collectionId }){
    return this.store.find('dashboard-collection', collectionId);
  }
});
