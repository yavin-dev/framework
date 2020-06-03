/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseMetadataTransform from './base-metadata-transform';

export default BaseMetadataTransform.extend({
  /**
   * @property {String} type - type of metadata
   * @override
   */
  type: 'dimension',

  /**
   * @override
   * @method deserialize
   *
   * Deserializes to a Ember Object or Array of Ember objects
   *
   * @param {String|Array} serialized
   * @returns {Object|Array} Ember Object | Array of Ember Objects
   */
  deserialize(serialized) {
    let namespace = null;

    if (serialized.includes('.')) {
      const splitName = serialized.split('.');
      namespace = splitName.shift();
      serialized = splitName.join('.');
    }

    // Lookup dimension id in time-dimensions if not found
    return (
      this.metadataService.getById(this.type, serialized, namespace) ||
      this.metadataService.getById('time-dimension', serialized, namespace)
    );
  }
});
