/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
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
   * @param {String} serialized
   * @returns {Object} Ember Object
   */
  deserialize(serialized) {
    let namespace = null;

    if (serialized.includes('.')) {
      const splitName = serialized.split('.');
      namespace = splitName[0];
      serialized = splitName[1];
    }

    return this.metadataService.getById(this.type, serialized, namespace);
  },

  /**
   * @method serialize
   *
   * Serialized to a string or array of strings
   *
   * @param {Object} deserialized
   * @returns {String|Null} - name
   */
  serialize(deserialized = {}) {
    if (typeof deserialized === 'string') {
      return deserialized;
    }

    return deserialized.id || null;
  }
});
