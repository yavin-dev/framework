/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::LookbackInput
 *       @filter={{filter}}
 *       @request={{request}}
 *       @onUpdateFilter={{action "update"}}
 *   />
 */
import BaseIntervalComponent from './base-interval-component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/filter-values/lookback-input';
import { computed, get, action } from '@ember/object';
import Duration from 'navi-core/utils/classes/duration';
import { isEmpty } from '@ember/utils';
import { MONTHS_IN_QUARTER } from '../filter-builders/date-time';

@templateLayout(layout)
@tagName('')
class LookbackInput extends BaseIntervalComponent {
  /**
   * @property {Number} lookback - The number of `dateTimePeriod`s to look back by
   */
  @computed('interval', 'dateTimePeriod')
  get lookback() {
    const duration = get(this.interval, '_start');
    const lookback = duration.getValue();
    if (this.dateTimePeriod === 'quarter') {
      return lookback / MONTHS_IN_QUARTER;
    }
    return lookback;
  }

  /**
   * Build the relative interval string
   * @param {Number} amount - the number to look back
   * @param {String} dateTimePeriod - the time grain size to look back by
   * @returns {Duration}
   */
  lookbackToDuration(amount, dateTimePeriod) {
    if (dateTimePeriod === 'quarter') {
      amount = amount * MONTHS_IN_QUARTER;
      dateTimePeriod = 'month';
    }
    if (dateTimePeriod === 'hour') {
      dateTimePeriod = 'day';
    }
    return new Duration(`P${amount}${dateTimePeriod[0].toUpperCase()}`);
  }

  /**
   * @action setLookback
   * @param {InputEvent} event - new interval to set in filter
   */
  @action
  setLookback({ target: { value } }) {
    if (isEmpty(value) || Number(value) < 1) {
      return;
    }
    const lookbackDuration = this.lookbackToDuration(value, this.dateTimePeriod);
    this.setInterval(lookbackDuration, 'current');
  }
}

export default LookbackInput;
