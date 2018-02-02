/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{cell-renderers/date-time
 *   data=row
 *   column=column
 *   request=request
 * }}
 */

import Ember from 'ember';
import layout from '../../templates/components/cell-renderers/date-time';
const { computed, get } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-cell-content', 'date-time'],

  /**
   * @property {String} value
   * Date start time from the response data or 'TOTAL'
   */
  value: computed.alias('data.dateTime'),

  /**
   * @property {String} granularity- Time Grain in request
   * Request can be either a model or a serialized form of
   * the model, timeGrain is an interval fragment in the model and a string in the serialized
   * request model
   */
  granularity: computed('request.logicalTable.timeGrain', function() {
    return get(this, 'request.logicalTable.timeGrain.name') || get(this, 'request.logicalTable.timeGrain');
  })
});
