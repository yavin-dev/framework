/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-cell-renderers/date-time
 *   data=row
 *   column=column
 *   request=request
 * }}
 */

import { alias, readOnly } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/navi-cell-renderers/date-time';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-cell-content', 'date-time'],

  /**
   * @property {String} value
   * Date start time from the response data or 'TOTAL'
   */
  value: alias('data.dateTime'),

  /**
   * @property {String} granularity- Time Grain in request
   * Request can be either a model or a serialized form of
   * the model, timeGrain is an interval fragment in the model and a string in the serialized
   * request model
   */
  granularity: readOnly('request.logicalTable.timeGrain')
});
