/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::Date
 *       @filter={{this.filter}}
 *       @request={{this.request}}
 *       @onUpdateFilter={{this.update}}
 *   />
 */
import { oneWay } from '@ember/object/computed';
import Component from '@ember/component';
import { action } from '@ember/object';
import Moment from 'moment';
import layout from '../../templates/components/filter-values/date';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class DateComponent extends Component {
  /**
   * @property {String} date - the date that's saved in the filter
   */
  @oneWay('filter.values.firstObject')
  date;

  /**
   * @action setDate
   * @param {Date} date - new date to set in filter
   */
  @action
  setDate(date) {
    this.onUpdateFilter({
      values: [Moment(date).format('YYYY-MM-DD')]
    });
  }
}

export default DateComponent;
