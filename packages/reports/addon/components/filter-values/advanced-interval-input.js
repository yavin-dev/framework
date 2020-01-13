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
import { computed } from '@ember/object';
import layout from '../../templates/components/filter-values/advanced-interval-input';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import DateUtils from 'navi-core/utils/date';
import Interval from 'navi-core/utils/classes/interval';
import moment from 'moment';

@templateLayout(layout)
@tagName('')
class AdvancedIntervalInputComponent extends BaseIntervalComponent {
  /**
   * @property {Object} dateStrings - the formatted {start, end} dates
   */
  @computed('interval')
  get dateStrings() {
    const { dateTimePeriod, interval } = this;
    let end;
    if (moment.isMoment(interval._end)) {
      const endMoment = interval.asMomentsForTimePeriod(dateTimePeriod).end;
      end = endMoment.clone().subtract(1, dateTimePeriod);
    } else {
      end = interval._end;
    }
    return new Interval(interval._start, end).asStrings(DateUtils.PARAM_DATE_FORMAT_STRING);
  }

  /**
   * Parses date string from the input fields
   *
   * @method parseDate
   * @param {String} date - date string from input
   * @returns {Duration|moment|string} - object most closely represented by the string
   */
  parseDate(date) {
    if (typeof date === 'string') {
      return Interval.fromString(date);
    }
    return date;
  }
}

export default AdvancedIntervalInputComponent;
