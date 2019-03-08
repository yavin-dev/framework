/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Service for converting an Ember Data model into a URL safe string
 */
import Service, { inject as service } from '@ember/service';

import { assert } from '@ember/debug';
import { get, computed } from '@ember/object';
import { run } from '@ember/runloop';

export default Service.extend({
  /**
   * @property {Ember.Service} store
   */
  store: service(),

  /**
   * @property {Object} codec - compression library
   */
  codec: computed(() => {
    return new window.JsonUrl('lzstring');
  }),

  /**
   * @method compress
   * @param {DS.Model} model - ember data model with id
   * @return {Promise} promise that resolves to a string representation of model safe for URL use
   */
  compress(model) {
    let serializedModel = model.serialize({ includeId: true });

    // Ember Data requires an id to push to the store
    assert('A model given to `compress` must have an id.', serializedModel.data.id);

    let modelPayload = JSON.stringify(serializedModel);
    return get(this, 'codec').compress(modelPayload);
  },

  /**
   * @method decompress
   * @param {String} string - result of a previous call to `compress`
   * @return {Promise} promise that resolvs to a new ember data model
   */
  decompress(string) {
    return get(this, 'codec')
      .decompress(string)
      .then(modelPayload => run(() => this._pushPayload(JSON.parse(modelPayload))));
  },

  /**
   * @method _pushPayload
   * @private
   * @param {Object} payload - json payload to push to store
   * @return {DS.Model} newly created model
   */
  _pushPayload(payload) {
    /*
     * Reimplement `pushPayload` to give a return value
     * Remove when `ds-pushpayload-return` feature flag has become default behavior in Ember Data
     * or when [store.push is overhauled](https://github.com/emberjs/rfcs/pull/161)
     */
    let store = get(this, 'store'),
      defaultSerializer = store.serializerFor('application'),
      normalizedPayload = defaultSerializer._normalizeDocumentHelper(payload);

    return store.push(normalizedPayload);
  }
});
