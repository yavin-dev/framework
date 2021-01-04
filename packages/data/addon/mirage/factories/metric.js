/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  index: i => i,

  id() {
    const id = this.table?.id;
    return `${id ? id + '.' : ''}metric${this.index}`;
  },

  name() {
    return `Metric ${this.index}`;
  },

  friendlyName() {
    return `Friendly Metric ${this.index}`;
  },

  description() {
    return `This is metric ${this.index}`;
  },

  category: 'categoryOne',

  valueType: 'NUMBER',

  tags: () => ['DISPLAY'],

  defaultFormat: 'number',

  columnType: 'field',

  expression: null
});
