/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  /**
   * @overide
   * @property {Object} attrs - model attribute config while serialization
   */
  attrs: {
    // Prevent sending below attributes in request payload
    responseFormat: {serialize: false}
  }
});
