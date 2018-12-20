/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{dropdown-date-picker
 *       onApply=(action 'onApply')
 *       savedDate=(moment savedDate)
 *   }}
 */
import Component from '@ember/component';
import layout from '../templates/components/dropdown-date-picker';

export default Component.extend({
  layout,

  /**
   * @property {Moment} selectedDate - local moment set by date picker
   */
  selectedDate: null,

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
    this.set('selectedDate', this.get('savedDate'));
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
