/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import JSONSerializer from '@ember-data/serializer/json';

export default class SortSerializer extends JSONSerializer {
  /**
   * @override
   * @property {Object} attrs
   */
  attrs = {
    //don't include source or cid in the payload
    source: { serialize: false },
    cid: { serialize: false },
  };
}
