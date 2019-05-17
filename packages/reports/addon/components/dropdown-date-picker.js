/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{dropdown-date-picker
 *       onUpdate=(action 'onUpdate')
 *       date=(moment savedDate)
 *   }}
 */
import { oneWay } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../templates/components/dropdown-date-picker';

export default Component.extend({
  layout,

  /**
   * @private
   * @property {Object} _selectedDate - local moment set by date picker (initally set to passed in date)
   */
  _selectedDate: oneWay('date'),

  actions: {
    /**
     * @action resetDate - set selected date to the saved date
     */
    resetDate() {
      this.set('_selectedDate', this.get('date'));
    }
  }
});
