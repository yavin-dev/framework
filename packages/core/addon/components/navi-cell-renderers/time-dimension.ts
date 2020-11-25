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

import BaseCellRenderer from './base';
import { computed } from '@ember/object';
//@ts-ignore
import { formatDateForGranularity } from 'navi-core/helpers/format-date-for-granularity';
import { Grain } from 'navi-data/addon/utils/date';

export default class TimeDimensionCellRenderer extends BaseCellRenderer {
  /**
   * Time Grain in request
   */
  @computed('args.column.fragment.parameters.grain')
  get timeGrain(): Grain {
    const { fragment } = this.args.column;
    return fragment.parameters?.grain as Grain;
  }

  get displayValue() {
    const { columnValue, timeGrain } = this;
    return formatDateForGranularity(`${columnValue}`, timeGrain);
  }
}
