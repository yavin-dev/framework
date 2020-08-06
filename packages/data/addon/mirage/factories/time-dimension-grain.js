/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  index: i => i,

  id() {
    return `timeDimension${this.index}`;
  },

  expression: null,

  grain: 'DAY'
});
