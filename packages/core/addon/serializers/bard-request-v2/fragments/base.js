/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import JSONSerializer from '@ember-data/serializer/json';

export default class BaseSerializer extends JSONSerializer {
  /**
   * @override
   * @property {Object} attrs
   */
  attrs = {
    //don't include source in the payload
    source: { serialize: false },
  };
}
