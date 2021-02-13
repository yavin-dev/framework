/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'miragejs';

export default Factory.extend({
  index: (i: number) => i,

  id() {
    return `table${this.index}`;
  },

  name() {
    return `table${this.index}`;
  },

  friendlyName() {
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
