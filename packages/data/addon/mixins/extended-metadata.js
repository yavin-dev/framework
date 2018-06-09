/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';

import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import ObjectProxy from '@ember/object/proxy';
import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';

export default Mixin.create({
  /**
   * @property {Ember.Service} metadata
   */
  metadata: service('bard-metadata'),

  /**
   * @property {Promise} extended
   */
  extended: computed(function() {
    let metadata = get(this, 'metadata'),
        type = get(this, 'type'),
        name = get(this, 'name');

    return ObjectProxy.extend(PromiseProxyMixin).create({
      promise: metadata.fetchById(type, name)
    });
  })
});
