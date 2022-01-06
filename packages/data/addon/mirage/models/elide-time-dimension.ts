/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  table: belongsTo('elide-table'),
  supportedGrains: hasMany('elide-time-dimension-grain'),
});
