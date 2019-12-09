/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/lookback-input
 *       filter=filter
 *       request=request
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import Component from '@ember/component';
import { layout as templateLayout, classNames } from '@ember-decorators/component';
import layout from '../../templates/components/filter-values/lookback-input';
import { computed, get, action } from '@ember/object';
import Interval from 'navi-core/utils/classes/interval';
import { isEmpty } from '@ember/utils';
import { formatDateRange } from 'navi-reports/helpers/format-interval-inclusive-inclusive';
import { getIsoDateTimePeriod } from 'navi-core/utils/date';

@templateLayout(layout)
@classNames('filter-values--lookback-input')
class LookbackInput extends Component {
  /**
   * @property {String} timeGrainName - The dateTimePeriod
   */
  @computed('request.logicalTable.timeGrain.name')
  get timeGrainName() {
    return get(this, 'request.logicalTable.timeGrain.name');
  }

  /**
   * @property {Interval} interval - The current interval
   */
  @computed('filter.values.firstObject')
  get interval() {
    return get(this, 'filter.values.firstObject');
  }

  /**
   * @property {String} dateRange - The representation of the selected inclusive interval
   */
  @computed('interval')
  get dateRange() {
    const { start, end } = this.interval.asMomentsForTimePeriod(this.timeGrainName);
    end.subtract(1, getIsoDateTimePeriod(this.timeGrainName));
    return formatDateRange(start, end, this.timeGrainName);
  }

  /**
   * @property {Number} lookback - The number of `timeGrainName`s to look back by
   */
  @computed('interval', 'timeGrainName')
  get lookback() {
    let val = get(this.interval, '_start._value');
    if (this.timeGrainName === 'quarter') {
      val = val / 3;
    }
    return val;
  }

  /**
   * Build the relative interval string
   * @param {Number} amount - the number to look back
   * @param {String} grain - the time grain size to look back by
   * @returns {string}
   */
  lookbackToDuration(amount, grain) {
    if (grain === 'quarter') {
      amount = amount * 3;
      grain = 'month';
    }
    return `P${amount}${grain[0].toUpperCase()}`;
  }

  /**
   * @action setInterval
   * @param {Interval} interval - new interval to set in filter
   */
  @action
  setLookback(interval) {
    if (isEmpty(interval) || Number(interval) < 1) {
      return;
    }
    this.onUpdateFilter({
      interval: Interval.parseFromStrings(this.lookbackToDuration(interval, this.timeGrainName), 'current')
    });
  }
}

export default LookbackInput;
