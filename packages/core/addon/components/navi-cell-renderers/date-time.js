/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-cell-renderers/date-time
 *   data=row
 *   column=column
 *   request=request
 * }}
 */

import { readOnly } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/navi-cell-renderers/date-time';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class DateTimeCellRenderer extends Component {
  /**
   * @property {String} value
   * Date start time from the response data or 'TOTAL'
   */
  @readOnly('data.dateTime')
  value;

  /**
   * @property {String} granularity- Time Grain in request
   * Request can be either a model or a serialized form of
   * the model, timeGrain is an interval fragment in the model and a string in the serialized
   * request model
   */
  @readOnly('request.logicalTable.timeGrain')
  granularity;
}
