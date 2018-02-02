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
  type: 'metric',

  /**
   * @method deserialize
   * @override
   */
  deserialize(serialized) {
    //for date
    if(serialized === 'dateTime'){
      return { name: 'dateTime' };
    }

    //for metric
    return this._super(...arguments);
  },
});
