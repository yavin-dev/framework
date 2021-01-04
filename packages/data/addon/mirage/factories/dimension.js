/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  index: i => i,

  id() {
    const id = this.table?.id;
    return `${id ? id + '.' : ''}dimension${this.index}`;
  },

  name() {
    return `Dimension ${this.index}`;
  },

  friendlyName() {
    return `Friendly Dimension ${this.index}`;
  },

  description() {
    return `This is dimension ${this.index}`;
  },

  category: 'categoryOne',

  valueType: 'TEXT',

  tags: () => ['DISPLAY'],

  columnType: 'field',

  expression: null,

  valueSourceType(i) {
    return { 1: 'ENUM', 2: 'TABLE' }[i] || 'NONE';
  },

  tableSource() {
    return this.valueSourceType === 'TABLE' ? `table0.dimension0` : null;
  },

  values() {
    return this.valueSourceType === 'ENUM'
      ? new Array(5).fill().map((_, idx) => {
          faker.seed(this.index + idx);
          return `${faker.commerce.productName()} (enum)`;
        })
      : [];
  }
});
