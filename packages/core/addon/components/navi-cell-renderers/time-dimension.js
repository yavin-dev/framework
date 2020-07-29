/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::TimeDimension
 *   @data={{this.row}}
 *   @column={{this.column}}
 *   @request={{this.request}}
 * />
 */

import Component from '@glimmer/component';

export default class DateTimeCellRenderer extends Component {
  /**
   * @property {String} value
   * Date start time from the response data or 'TOTAL'
   */
  get value() {
    return this.args.data[this.args.column.attributes.name];
  }

  /**
   * @property {String} granularity- Time Grain in request
   * Request can be either a model or a serialized form of
   * the model, timeGrain is an interval fragment in the model and a string in the serialized
   * request model
   */
  get granularity() {
    return this.args.request.timeGrain;
  }
}
