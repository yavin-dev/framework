/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { helper as buildHelper } from '@ember/component/helper';
import type { MetricColumn } from 'navi-data/models/metadata/metric';
import type { ResponseRow } from 'navi-data/models/navi-fact-response';
import type { MetricValue } from 'navi-data/serializers/facts/interface';

export function tooltipValueFormatter([value, column, row]: [MetricValue, MetricColumn, ResponseRow]) {
  return column.columnMetadata.formatValue(value, column, row);
}

export default buildHelper(tooltipValueFormatter);
