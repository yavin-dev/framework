/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  index: i => i,

  id() {
    const id = this.table?.id;
    return `${id ? id + '.' : ''}timeDimension${this.index}`;
  },

  name() {
    return `Time Dimension ${this.index}`;
  },

  friendlyName() {
    return `Friendly Time Dimension ${this.index}`;
  },

  description() {
    return `This is time dimension ${this.index}`;
  },

  category: 'categoryOne',

  valueType: 'TIME',

  tags: () => ['DISPLAY'],

  columnType: 'field',

  expression: null,

  timeZoneId: 'UTC'
});
