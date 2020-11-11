/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  index: i => i,

  id() {
    return `table${this.index}`;
  },

  name() {
    return `Table ${this.index}`;
  },

  isFact: true,

  description() {
    return `This is Table ${this.index}`;
  },

  category: 'categoryOne',

  cardinality: 'SMALL',

  tableTags: () => ['IMPORTANT']
});
