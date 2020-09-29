/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  index: i => i,

  id() {
    const id = this.table?.id;
    return `${id ? id + '.' : ''}dimension${this.index}`;
  },

  name() {
    return `Dimension ${this.index}`;
  },

  description() {
    return `This is dimension ${this.index}`;
  },

  category: 'categoryOne',

  valueType: 'TEXT',

  tags: () => ['DISPLAY'],

  columnType: 'field',

  expression: null
});
