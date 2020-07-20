import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  index: i => i,

  id() {
    return `metric${this.index}`;
  },

  name() {
    return `Metric ${this.index}`;
  },

  description() {
    return `This is metric ${this.index}`;
  },

  category: 'categoryOne',

  valueType: 'NUMBER',

  columnTags: () => ['DISPLAY'],

  defaultFormat: 'number',

  columnType: 'field',

  expression: null
});
