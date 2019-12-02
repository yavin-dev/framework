/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/date-range
 *       filter=filter
 *       request=request
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import Component from '@ember/component';
import layout from '../../templates/components/filter-values/date-range';
import { get, set, action } from '@ember/object';
import { layout as templateLayout, classNames } from '@ember-decorators/component';
import Interval from 'navi-core/utils/classes/interval';

@templateLayout(layout)
@classNames('filter-values--date-range-input')
export default class extends Component {
  init() {
    super.init(...arguments);
    const { start, end } = get(this, 'filter.values.firstObject').asMoments();
    this.startDate = start;
    this.endDate = end;
  }

  /**
   * @property {Moment} startDate - start of interval
   */
  startDate;

  /**
   * @property {Moment} endDate - end of interval
   */
  endDate;

  /**
   * @action setInterval
   * @param {Moment} start - start date for interval
   * @param {Moment} end - end date for interval
   */
  @action
  setInterval(start, end) {
    this.onUpdateFilter({
      interval: new Interval(start, end)
    });
  }

  /**
   * @action setLowValue
   * @param {Moment} value - start date for interval
   */
  @action
  setLowValue(value) {
    set(this, 'startDate', value);
    this.setInterval(this.startDate, this.endDate);
  }

  /**
   * @action setHighValue
   * @param {Moment} value - end date for interval
   */
  @action
  setHighValue(value) {
    set(this, 'endDate', value);
    this.setInterval(this.startDate, this.endDate);
  }
}
