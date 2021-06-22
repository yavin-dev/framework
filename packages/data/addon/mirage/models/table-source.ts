/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Model, hasMany } from 'miragejs';

export default Model.extend({
  valueSource: hasMany('dimension', { inverse: null }),
  suggestionColumns: hasMany('dimension', { inverse: null }),
});
