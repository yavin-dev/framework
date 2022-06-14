/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { Parameters } from '../../request.js';
import type ColumnMetadataModel from '../../models/metadata/column.js';
import type { MetricColumn } from '../../models/metadata/metric.js';
import type { ResponseRow } from '../../models/navi-fact-response.js';
import type { MetricValue } from '../../serializers/facts/interface.js';

export default interface FormatterService {
  formatNiceColumnName(
    columnMetadata?: ColumnMetadataModel,
    parameters?: Parameters,
    alias?: string | null
  ): Promise<string>;

  formatColumnName(columnMetadata?: ColumnMetadataModel, parameters?: Parameters, alias?: string | null): string;

  formatMetricValue(value: MetricValue, _column: MetricColumn, _row: ResponseRow, requestedFormat?: string): string;
}

declare module './registry' {
  export default interface ServiceRegistry {
    'navi-formatter': FormatterService;
  }
}
