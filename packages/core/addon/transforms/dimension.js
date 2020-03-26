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
   * @method deserialize
   *
   * Deserializes to a Ember Object or Array of Ember objects
   *
   * @param {String|Array} serialized
   * @returns {Object|Array} Ember Object | Array of Ember Objects
   */
  deserialize(serialized) {
    let metadataService = this.metadataService;

    if (Array.isArray(serialized)) {
      return serialized.map(
        dimension =>
          metadataService.getById('dimension', dimension) || metadataService.getById('time-dimension', dimension)
      );
    }

    // Lookup dimension id in time-dimensions if not found
    return metadataService.getById('dimension', serialized) || metadataService.getById('time-dimension', serialized);
  }
});
