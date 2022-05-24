/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { Grain } from '@yavin/client/utils/date';
import Args from '../args-interface';
import FilterFragment from 'navi-core/models/request/filter';

type TimeFilterFragment = FilterFragment & { values: string[] };
interface TimeDimensionFilterArgs extends Args {
  filter: TimeFilterFragment;
  onUpdateFilter(changeSet: Partial<TimeFilterFragment>): void;
}

export default class BaseTimeDimensionFilter extends Component<TimeDimensionFilterArgs> {
  startPlaceholder = 'Start';

  endPlaceholder = 'End';

  @readOnly('args.filter.parameters.grain') grain!: Grain;

  /**
   * Currently the date picker only supports down to the day
   */
  get calendarGrain() {
    const grain = this.args.filter.parameters.grain as Grain;
    if (grain === 'hour' || grain === 'minute' || grain === 'second') {
      return 'day';
    }
    return grain;
  }

  /**
   * the datetime format to display based on the time grain
   */
  @computed('grain')
  get calendarTriggerFormat() {
    const dateMap: Partial<Record<Grain, string>> = {
      hour: 'MMM DD, YYYY',
      day: 'MMM DD, YYYY',
      month: 'MMM YYYY',
      quarter: '[Q]Q YYYY',
      year: 'YYYY',
    };
    return dateMap[this.grain] || dateMap.day;
  }

  /**
   * @param values - sets the values array for the time filter
   */
  @action
  setTimeValues(values: string[]) {
    this.args.onUpdateFilter({ values });
  }

  /**
   * @param start - start date for interval
   */
  @action
  setTimeStart(start: string) {
    const { values } = this.args.filter;
    this.setTimeValues([start, values[1]]);
  }

  /**
   * @param end - end date for interval
   */
  @action
  setTimeEnd(end: string) {
    const { values } = this.args.filter;
    this.setTimeValues([values[0], end]);
  }
}
