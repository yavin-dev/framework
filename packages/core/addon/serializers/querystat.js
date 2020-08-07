/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  //console.log('Serializer Initialized');
  extractArray(firstArg, secondArg, payload) {
    return this._super(firstArg, secondArg, payload);
  }
});
