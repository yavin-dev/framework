/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-builders/date-time
 *       requestFragment=request.filters.firstObject
 *       request=request
 *   }}
 */
import Ember from 'ember';
import Base from './base';

const { computed, get } = Ember;

export default Base.extend({
  /**
   * @property {Object} requestFragment - interval fragment from request
   */
  requestFragment: undefined,

  /**
   * @property {Array} supportedOperators
   * @override
   */
  supportedOperators: [
    { id: 'in', longName: 'In Range', valuesComponent: 'filter-values/date-range' }
  ],

  /**
   * @property {Object} filter
   * @override
   */
  filter: computed('requestFragment.interval', 'request.logicalTable.timeGrain', function() {
    let interval = get(this, 'requestFragment.interval'),
        timeGrainName = get(this, 'request.logicalTable.timeGrain.longName'),
        longName = `Date Time (${timeGrainName})`,
        operator = get(this, 'supportedOperators')[0]; // Only 1 operator allowed

    return {
      subject: { longName },
      operator,
      values: Ember.A([interval])
    };
  })
});
