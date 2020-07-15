import { Factory } from 'ember-cli-mirage';

export default class DimensionFactory extends Factory {
  index = i => i;

  get id() {
    return `dimension${this.index}`;
  }

  get name() {
    return `Dimension ${this.index}`;
  }

  description() {
    return `This is dimension ${this.index}`;
  }

  category = 'categoryOne';

  valueType = 'TEXT';

  columnTags = () => ['DISPLAY'];

  columnType = 'field';

  expression = null;
}
