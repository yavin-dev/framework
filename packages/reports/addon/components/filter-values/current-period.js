/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/current-period
 *       filter=filter
 *       request=request
 *   }}
 */
import Component from '@ember/component';
import { layout as templateLayout, classNames } from '@ember-decorators/component';
import layout from '../../templates/components/filter-values/current-period';
import { computed, get } from '@ember/object';

@templateLayout(layout)
@classNames('filter-values--current-period')
class CurrentPeriod extends Component {
  /**
   * @property {String} timeGrainName - The dateTimePeriod
   */
  @computed('request.logicalTable.timeGrain')
  get dateTimePeriod() {
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
   * @property {Moment} startDate - The current start date
   */
  @computed('interval')
  get startDate() {
    return this.interval.asMomentsForTimePeriod(this.dateTimePeriod).start;
  }

  /**
   * @property {Moment} startDate - The current start date
   */
  @computed('interval')
  get endDate() {
    return this.interval.asMomentsForTimePeriod(this.dateTimePeriod).end;
  }
}

export default CurrentPeriod;
