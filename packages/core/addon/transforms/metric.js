/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseMetadataTransform from './base-metadata-transform';

export default BaseMetadataTransform.extend({
  /**
   * @property {String} type - type of metadata
   * @override
   */
  type: 'metric',

  /**
   * @method deserialize
   * @override
   */
  deserialize(serialized) {
    //This is used for special case of dateTime in sorting
    if (serialized === 'dateTime' || serialized.endsWith('.dateTime')) {
      return { id: 'dateTime' };
    }

    //for metric
    return this._super(...arguments);
  }
});
