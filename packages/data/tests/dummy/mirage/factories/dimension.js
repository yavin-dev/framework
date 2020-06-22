import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  index(i) {
    return i;
  },
  id() {
    return `dimension${this.index}`;
  },
  name() {
    return `Dimension ${this.index}`;
  },
  description() {
    return `This is dimension ${this.index}`;
  },
  category: 'categoryOne',
  valueType: 'TEXT',
  columnTags: () => ['DISPLAY'],
  columnType: 'field',
  expression: null
});
