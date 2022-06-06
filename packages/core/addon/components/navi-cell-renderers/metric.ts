/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <NaviCellRenderers::Metric
 *   @data={{row}}
 *   @column={{column}}
 *   @request={{request}}
 *   @requestColumn={{request}}
 * />
 */
import BaseCellRenderer from './base';
import type ColumnFragment from 'navi-core/models/request/column';
import type { MetricValue } from '@yavin/client/serializers/facts/interface';

export default class MetricCellRenderer extends BaseCellRenderer {
  /**
   * value to be rendered on the cell
   */
  get displayValue(): string {
    const { column } = this.args;
    const fragment = column.fragment as ColumnFragment<'metric'>;
    return fragment.columnMetadata.formatValue(
      this.columnValue as MetricValue,
      fragment,
      this.args.data,
      column.attributes.format
    );
  }
}
