import { Factory } from 'ember-cli-mirage';

export default class TableFactory extends Factory {
  index = i => i;

  get id() {
    return `table${this.index}`;
  }

  get name() {
    return `Table ${this.index}`;
  }

  get description() {
    return `This is Table ${this.index}`;
  }

  category = 'categoryOne';

  cardinality = 'SMALL';

  tableTags = ['IMPORTANT'];
}
