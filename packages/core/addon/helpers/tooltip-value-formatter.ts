/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { helper as buildHelper } from '@ember/component/helper';
import type { MetricColumn } from '@yavin/client/models/metadata/metric';
import type { ResponseRow } from '@yavin/client/models/navi-fact-response';
import type { MetricValue } from '@yavin/client/serializers/facts/interface';

export function tooltipValueFormatter([value, column, row]: [MetricValue, MetricColumn, ResponseRow]) {
  return column.columnMetadata.formatValue(value, column, row);
}

export default buildHelper(tooltipValueFormatter);
