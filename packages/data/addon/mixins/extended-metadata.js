/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

const { computed, get, inject } = Ember;

export default Ember.Mixin.create({
  /**
   * @property {Ember.Service} metadata
   */
  metadata: inject.service('bard-metadata'),

  /**
   * @property {Promise} extended
   */
  extended: computed(function() {
    let metadata = get(this, 'metadata'),
      type = get(this, 'type'),
      name = get(this, 'name');

    return Ember.ObjectProxy.extend(Ember.PromiseProxyMixin).create({
      promise: metadata.fetchById(type, name)
    });
  })
});
