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
import Component from '@ember/component';
import layout from '../templates/components/dropdown-date-picker';

export default Component.extend({
  layout,

  /**
   * @private
   * @property {Object} selectedDate - local moment set by date picker
   */
  _selectedDate: null,

  /**
   * @method init
   * @override
   */
  init() {
    this._super(...arguments);

    this.loadSavedDate();
  },

  /**
   * @method loadSavedDate
   */
  loadSavedDate() {
    this.set('_selectedDate', this.get('date'));
  },

  actions: {
    /**
     * @action resetDate - set selected date to the saved date
     */
    resetDate() {
      this.loadSavedDate();
    }
  }
});
