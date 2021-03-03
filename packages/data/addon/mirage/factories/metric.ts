/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'miragejs';

export default Factory.extend({
  index: (i: number) => i,

  id(): string {
    //@ts-ignore
    return `${this.table?.id}.metric${this.index}`;
  },

  name() {
    return `metric${this.index}`;
  },

  friendlyName() {
    return `Metric ${this.index}`;
  },

  description() {
    return `This is metric ${this.index}`;
  },

  category: 'categoryOne',

  valueType: 'NUMBER',

  tags: () => ['DISPLAY'],

  defaultFormat: 'number',

  columnType: 'field',

  expression: null,
});
