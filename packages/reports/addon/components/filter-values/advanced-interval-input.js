/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::AdvancedIntervalInput
 *       @filter={{filter}}
 *       @request={{request}}
 *       @onUpdateFilter={{action "update"}}
 *   />
 */
import BaseIntervalComponent from './base-interval-component';
import { computed, action } from '@ember/object';
import layout from '../../templates/components/filter-values/advanced-interval-input';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import DateUtils from 'navi-data/utils/date';
import Interval from 'navi-data/utils/classes/interval';

@templateLayout(layout)
@tagName('')
class AdvancedIntervalInputComponent extends BaseIntervalComponent {
  /**
   * @property {Object} dateStrings - the formatted {start, end} dates
   */
  @computed('interval')
  get dateStrings() {
    const { interval } = this;
    return new Interval(interval._start, interval._end).asStrings(DateUtils.PARAM_DATE_FORMAT_STRING);
  }

  /**
   * Parses date string from the input fields
   *
   * @method parseDate
   * @param {InputEvent} event - date string input event
   * @returns {Duration|moment|string} - object most closely represented by the string
   */
  parseDate({ target: { value } }) {
    if (typeof value === 'string') {
      return Interval.fromString(value);
    }
    return value;
  }

  /**
   * @action setIntervalEndExact
   * @param {Moment} value - end date for interval
   */
  @action
  setIntervalEndExact(value) {
    return this.setInterval(this.interval._start, value, false);
  }
}

export default AdvancedIntervalInputComponent;
