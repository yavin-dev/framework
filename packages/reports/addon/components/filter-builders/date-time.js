/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-builders/date-time
 *       requestFragment=request.filters.firstObject
 *       request=request
 *   }}
 */
import { A as arr } from '@ember/array';
import { get, computed } from '@ember/object';
import Base from './base';

export default Base.extend({
  /**
   * @override
   * @param {Array} supportedOperators - list of valid operators for a date-time filter
   */
  supportedOperators: computed(function() {
    return [
      {
        id: 'in',
        longName: 'In Range',
        valuesComponent: 'filter-values/date-range'
      }
    ];
  }),

  /**
   * @property {Object} requestFragment - interval fragment from request
   */
  requestFragment: undefined,

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
      values: arr([interval])
    };
  })
});
