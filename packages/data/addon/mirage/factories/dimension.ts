/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  index: (i: number) => i,

  id() {
    return `${this.table?.id}.dimension${this.index}`;
  },

  name() {
    return `dimension${this.index}`;
  },

  friendlyName() {
    return `Dimension ${this.index}`;
  },

  description() {
    return `This is dimension ${this.index}`;
  },

  category: 'categoryOne',

  valueType: 'TEXT',

  tags: () => ['DISPLAY'],

  columnType: 'field',

  expression: null,

  valueSourceType(i: number) {
    if (i === 1) {
      return 'ENUM';
    } else if (i === 2) {
      return 'TABLE';
    }
    return 'NONE';
  },

  tableSource() {
    return this.valueSourceType === 'TABLE' ? `table0.dimension0` : null;
  },

  values() {
    return this.valueSourceType === 'ENUM'
      ? new Array(5).fill(undefined).map((_, idx) => {
          faker.seed(this.index + idx);
          return `${faker.commerce.productName()} (enum)`;
        })
      : [];
  }
});
