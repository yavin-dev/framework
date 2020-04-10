import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  index(i) {
    return i;
  },
  id() {
    return `table${this.index}`;
  },
  name() {
    return `Table ${this.index}`;
  },
  description() {
    return `This is Table ${this.index}`;
  },
  category: 'categoryOne',
  cardinalitySize: 'SMALL',
  tags() {
    return ['IMPORTANT'];
  }
});
