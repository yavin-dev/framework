import { Factory } from 'ember-cli-mirage';

export default class TimeDimensionFactory extends Factory {
  index = i => i;

  get id() {
    return `timeDimension${this.index}`;
  }

  get name() {
    return `Time Dimension ${this.index}`;
  }

  get description() {
    return `This is time dimension ${this.index}`;
  }

  category = 'categoryOne';

  valueType = 'TIME';

  columnTags = ['DISPLAY'];

  columnType = 'field';

  expression = null;

  supportedGrains = [];

  get timeZone() {
    return { short: 'UTC', long: 'Universal Time Coordinated' };
  }
}
