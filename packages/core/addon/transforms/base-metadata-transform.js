/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { isArray } from '@ember/array';
import DS from 'ember-data';

export default DS.Transform.extend({
  /**
   * @property {Service} metadataService
   */
  metadataService: service('bard-metadata'),

  /**
   * @property {String} type - type of transform
   */
  type: undefined,

  /**
   * @method deserialize
   *
   * Deserializes to a Ember Object or Array of Ember objects
   *
   * @param {String|Array} serialized
   * @returns {Object|Array} Ember Object | Array of Ember Objects
   */
  deserialize(serialized) {
    let metadataService = get(this, 'metadataService');

    if (isArray(serialized)) {
      return serialized.map(dimension => metadataService.getById(get(this, 'type'), dimension));
    }

    return metadataService.getById(get(this, 'type'), serialized);
  },

  /**
   * @method serialize
   *
   * Serialized to a string or array of strings
   *
   * @param {Object|Array} deserialized
   * @returns {String|Array|Null} - name | array of names
   */
  serialize(deserialized = {}) {
    if (typeof deserialized === 'string') {
      return deserialized;
    }

    if (isArray(deserialized)) {
      return deserialized.map(item => get(item, 'name') || null);
    }

    return get(deserialized, 'name') || null;
  }
});
