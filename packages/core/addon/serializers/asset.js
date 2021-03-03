/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseJsonSerializer from 'navi-core/serializers/base-json-serializer';

export default BaseJsonSerializer.extend({
  /**
   * @overide
   * @property {Object} attrs - model attribute config while serialization
   */
  attrs: {
    // Prevent sending below attributes in request payload
    createdOn: { serialize: false },
    updatedOn: { serialize: false },
  },
});
