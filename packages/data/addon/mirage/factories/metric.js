import { Factory } from 'ember-cli-mirage';

export default class MetricFactory extends Factory {
  index = i => i;

  get id() {
    return `metric${this.index}`;
  }

  get name() {
    return `Metric ${this.index}`;
  }

  get description() {
    return `This is metric ${this.index}`;
  }

  category = 'categoryOne';

  valueType = 'NUMBER';

  columnTags = ['DISPLAY'];

  defaultFormat = 'number';

  columnType = 'field';

  expression = null;
}
