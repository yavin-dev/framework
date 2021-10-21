/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <Filter::Values::DimensionDateRange
 *     @filter={{this.filter}}
 *     @onUpdateFilter={{this.update}}
 *   />
 */
import BaseIntervalComponent from './base-interval';
import { action } from '@ember/object';
import { Moment } from 'moment';

export default class DimensionDateRange extends BaseIntervalComponent {
  /**
   * @param start - first value to be set in filter
   */
  @action
  setTimeStartMoment(start: Moment) {
    this.setTimeStart(start.toISOString());
  }

  /**
   * @param end - last value to be set in filter
   */
  @action
  setTimeEndMoment(end: Moment) {
    this.setTimeEnd(end.toISOString());
  }
}
