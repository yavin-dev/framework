/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'miragejs';

export default Factory.extend({
  index: (i: number) => i,

  id(): string {
    //@ts-ignore
    return `${this.table?.id}.timeDimension${this.index}`;
  },

  name() {
    return `timeDimension${this.index}`;
  },

  friendlyName() {
    return `Time Dimension ${this.index}`;
  },

  description() {
    return `This is time dimension ${this.index}`;
  },

  category: 'categoryOne',

  valueType: 'TIME',

  tags: () => ['DISPLAY'],

  columnType: 'field',

  expression: null,

  timeZoneId: 'UTC',
});
