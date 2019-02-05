/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{navi-date-range-picker
 *      interval=selectedInterval
 *      dateTimePeriod='month'
 *      onSetInterval=(action 'updateInterval')
 *   }}
 */
import Ember from 'ember';
import Duration from 'navi-core/utils/classes/duration';
import Interval from 'navi-core/utils/classes/interval';
import config from 'ember-get-config';
import layout from '../templates/components/navi-date-range-picker';
import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';

const { computed, get } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} list of class names given to element
   */
  classNames: ['navi-date-range-picker'],

  /**
   * @property {Array} list of class name bindings
   */
  classNameBindings: ['interval:interval-set'],

  /**
   * @property {String} dateTimePeriod - time grain being used for calendar selection
   */
  dateTimePeriod: undefined,

  /**
   * @property {Boolean} showAdvancedCalendar
   */
  showAdvancedCalendar: false,

  /**
   * @property {Object} customRange - custom range interval, or default interval
   */
  customRange: computed.or('interval', 'defaultInterval'),

  /**
   * @property {Object} defaultInterval - get a default interval based on the dateTime period
   */
  defaultInterval: computed('dateTimePeriod', function() {
    let dateTimePeriod = get(this, 'dateTimePeriod');
    return new Interval(new Duration(DefaultIntervals[dateTimePeriod]), 'current');
  }),

  /**
   * @property {Array} predefinedRanges - list of ranges based on time grain supported look backs
   */
  predefinedRanges: computed('dateTimePeriod', function() {
    let dateTimePeriod = get(this, 'dateTimePeriod'),
      predefinedRanges = get(config, `navi.predefinedIntervalRanges.${dateTimePeriod}`) || Ember.A();

    return predefinedRanges.map(lookBack => {
      // If lookback = current/next, then we are checking for the current freq
      if (lookBack === 'current/next') {
        return {
          isActive: false,
          interval: new Interval('current', 'next')
        };
      } else {
        let duration = new Duration(lookBack);
        // Construct a range object used by the picker
        return {
          isActive: false,
          interval: new Interval(duration, 'current')
        };
      }
    });
  }),

  /**
   * @property (Array} ranges - list of ranges with `isActive` flag
   */
  ranges: Ember.computed('dateTimePeriod', 'interval', 'predefinedRanges', function() {
    let ranges = this.get('predefinedRanges');
    ranges.forEach(range => {
      Ember.set(range, 'isActive', this.isActiveInterval(range.interval));
    });
    return ranges;
  }),

  /**
   * @property {Boolean} isCustomRangeActive - whether or not selected interval is a custom range
   */
  isCustomRangeActive: computed('interval', 'ranges', function() {
    // Custom range is considered active when the selected interval does not match any existing range
    return get(this, 'interval') && !Ember.A(get(this, 'ranges')).isAny('isActive');
  }),

  /**
   * Called when the attributes passed into the component have been updated and on initial render
   *
   * @method didReceiveAttrs
   * @override
   */
  didReceiveAttrs() {
    Ember.assert('dateTimePeriod must be defined in order to use navi-date-range-picker', get(this, 'dateTimePeriod'));
    this._super(...arguments);
  },

  /**
   * @method isActiveInterval
   * @param {Interval} interval - object to check
   * @returns {Boolean} true if the given interval equals the selected interval
   */
  isActiveInterval(interval) {
    if (!this.get('interval')) {
      return false;
    }

    return this.get('interval').isEqual(interval);
  }
});
