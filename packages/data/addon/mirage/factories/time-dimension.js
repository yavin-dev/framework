import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  index: i => i,

  id() {
    return `timeDimension${this.index}`;
  },

  name() {
    return `Time Dimension ${this.index}`;
  },

  description() {
    return `This is time dimension ${this.index}`;
  },

  category: 'categoryOne',

  valueType: 'TIME',

  columnTags: () => ['DISPLAY'],

  columnType: 'field',

  expression: null,

  supportedGrains: () => [],

  timeZone() {
    return { short: 'UTC', long: 'Universal Time Coordinated' };
  }
});
