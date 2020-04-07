/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import JSONSerializer from '@ember-data/serializer/json';

export default class RequestSerializer extends JSONSerializer {
  /**
   * @property {Object} attrs - mapping between model properties and serialized json keys
   * @override
   */
  attrs = {
    // prevents sending below attributes in request payload
    responseFormat: { serialize: false }
  };
}
