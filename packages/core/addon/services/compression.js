/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Service for converting an Ember Data model into a URL safe string
 */
import Service, { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { get, computed } from '@ember/object';
import { run } from '@ember/runloop';
import JsonUrl from 'json-url';

export default Service.extend({
  /**
   * @property {Ember.Service} store
   */
  store: service(),

  /**
   * @property {Object} codec - compression library
   */
  codec: computed(function () {
    return new JsonUrl('lzstring');
  }),

  /**
   * @method compress
   * @param {Object} obj - object to compress
   * @return {Promise} promise that resolves to a string representation of object safe for URL use
   */
  compress(obj) {
    let payload = JSON.stringify(obj);
    return get(this, 'codec').compress(payload);
  },

  /**
   * @method decompress
   * @param {String} string - result of a previous call to `compress`
   * @return {Promise} promise that resolves to an object
   */
  decompress(string) {
    return get(this, 'codec')
      .decompress(string)
      .then((jsonStr) => JSON.parse(jsonStr));
  },

  /**
   * @method compressModel
   * @param {DS.Model} model - ember data model with id
   * @return {Promise} promise that resolves to a string representation of model safe for URL use
   */
  compressModel(model) {
    let serializedModel = model.serialize({ includeId: true });

    // Ember Data requires an id to push to the store
    assert('A model given to `compress` must have an id.', serializedModel.data.id);
    return this.compress(serializedModel);
  },

  /**
   * @method decompressModel
   * @param {String} string - result of a previous call to `compress`
   * @return {Promise} promise that resolvs to a new ember data model
   */
  decompressModel(string) {
    return this.decompress(string).then((modelPayload) => run(() => this._pushPayload(modelPayload)));
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
  },
});
