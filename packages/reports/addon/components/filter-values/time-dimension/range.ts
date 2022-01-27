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
    // if the start date is after the end date, set the end date to the start date
    if (start.isAfter(this.endDate)) {
      this.setTimeValues([start.toISOString(), start.toISOString()]);
    } else {
      this.setTimeStart(start.toISOString());
    }
  }

  /**
   * @param end - last value to be set in filter
   */
  @action
  setTimeEndMoment(end: Moment) {
    // if the end date is before the start date, set the start date to the end date
    if (end.isBefore(this.startDate)) {
      this.setTimeValues([end.toISOString(), end.toISOString()]);
    } else {
      this.setTimeEnd(end.toISOString());
    }
  }
}
