/**
 * Copyright 2017, Yahoo Holdings Inc.
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

@templateLayout(layout)
@classNames('filter-values--lookback-input')
export default class extends Component {
  @computed('request.logicalTable.timeGrain.name')
  get timeGrainName() {
    return get(this, 'request.logicalTable.timeGrain.name');
  }

  @computed('filter.values.firstObject')
  get interval() {
    debugger;
    return get(this, 'filter.values.firstObject');
  }

  @computed('interval')
  get dateRange() {
    const { start, end } = this.interval.asMoments();
    return formatDateRange(start, end, this.timeGrainName);
  }

  @computed('interval', 'timeGrainName')
  get lookback() {
    let val = get(this.interval, '_start._value');
    if (this.timeGrainName === 'quarter') {
      val = val / 3;
    }
    return val;
  }

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
    debugger;
    this.onUpdateFilter({
      interval: Interval.parseFromStrings(this.lookbackToDuration(interval, this.timeGrainName), 'current')
    });
  }
}
