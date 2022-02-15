/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'miragejs';
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

  cardinality(i: number) {
    if (i === 1) {
      return 'TINY';
    } else if (i === 2) {
      return 'SMALL';
    }
    return 'UNKNOWN';
  },

  category: 'categoryOne',

  valueType: 'TEXT',

  tags: () => ['DISPLAY'],

  columnType: 'FIELD',

  expression: null,

  valueSourceType(i: number) {
    if (i === 1) {
      return 'ENUM';
    } else if (i === 2) {
      return 'TABLE';
    }
    return 'NONE';
  },

  tableSourceIds() {
    if (this.valueSourceType === 'TABLE') {
      return ['tableSource0'];
    }
    return [];
  },

  values() {
    return this.valueSourceType === 'ENUM'
      ? new Array(5).fill(undefined).map((_, idx) => {
          faker.seed(this.index + idx);
          return `${faker.commerce.productName()} (enum)`;
        })
      : [];
  },
});
