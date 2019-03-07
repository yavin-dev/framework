/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import { isEmpty } from '@ember/utils';

export default DS.JSONSerializer.extend({
  serialize() {
    let json = this._super(...arguments);

    /*
     * removes the 'parameters' key if the key is empty for the serialization
     * `isEmpty` returns true on `{}` so we need the other test
     */
    if (isEmpty(json.parameters) || Object.entries(json.parameters).length === 0) {
      delete json.parameters;
    }
    return json;
  },

  normalize(type, hash) {
    const newHash = (typeof hash === 'string' && { metric: hash }) || hash;

    return this._super(type, newHash);
  }
});
