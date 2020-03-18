/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the dimension endpoint
 */

import EmberObject from '@ember/object';

export default class DimensionSerializer extends EmberObject {
  /**
   * @private
   * @method _normalizeDimensions - normalizes the JSON response
   * @param {Object[]} dimensions - JSON response objects
   * @param {String} source - datasource name
   * @returns {Object[]} - normalized dimension objects
   */
  _normalizeDimensions(dimensions, source) {
    return dimensions.map(dimension => {
      const { name: id, longName: name, description, category, datatype: valueType, storageStrategy } = dimension;

      return {
        id,
        name,
        description,
        category,
        valueType,
        source,
        storageStrategy
      };
    });
  }

  /**
   * @method normalize - normalizes the JSON response
   * @param {Object[]} payload - JSON response object
   * @param {String} source - datasource name
   * @returns {Object} - normalized JSON object
   */
  normalize(payload, source) {
    if (payload && payload.dimensions) {
      return this._normalizeDimensions(payload.dimensions, source);
    }
  }
}
