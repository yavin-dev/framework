/**
 * Copyright 2021, Yahoo Holdings Inc.
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
//@ts-ignore
import { formatDateForGranularity } from 'navi-core/helpers/format-date-for-granularity';
import { Grain } from '@yavin/client/utils/date';

export default class TimeDimensionCellRenderer extends BaseCellRenderer {
  /**
   * Time Grain in request
   */
  get timeGrain(): Grain {
    const { fragment } = this.args.column;
    return fragment.parameters?.grain as Grain;
  }

  get displayValue() {
    const { columnValue, timeGrain } = this;
    const { isRollup, isGrandTotal } = this.args;
    let blankValue = '--';
    if (isGrandTotal) {
      blankValue = '';
    } else if (isRollup) {
      blankValue = '\xa0'; //non-breaking space
    }
    return formatDateForGranularity(`${columnValue}`, timeGrain, blankValue);
  }
}
