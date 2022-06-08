/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type TableMetadataModel from '../../models/metadata/table.js';
import type MetricMetadataModel from '../../models/metadata/metric.js';
import type DimensionMetadataModel from '../../models/metadata/dimension.js';
import type TimeDimensionMetadataModel from '../../models/metadata/time-dimension.js';
import type ColumnFunctionMetadataModel from '../../models/metadata/column-function.js';
import type RequestConstraintMetadataModel from '../../models/metadata/request-constraint.js';

export interface EverythingMetadataPayload {
  tables: TableMetadataModel[];
  metrics: MetricMetadataModel[];
  dimensions: DimensionMetadataModel[];
  timeDimensions: TimeDimensionMetadataModel[];
  columnFunctions?: ColumnFunctionMetadataModel[];
  requestConstraints: RequestConstraintMetadataModel[];
}

export interface MetadataModelMap {
  everything: EverythingMetadataPayload;
  table: TableMetadataModel[];
  requestConstraint: RequestConstraintMetadataModel[];
  metric: MetricMetadataModel[];
  dimension: DimensionMetadataModel[];
  timeDimension: TimeDimensionMetadataModel[];
  columnFunction: ColumnFunctionMetadataModel[];
}

export type RawMetadataPayload = unknown;

export default interface MetadataSerializer {
  normalize<K extends keyof MetadataModelMap>(
    type: K,
    rawPayload: RawMetadataPayload,
    dataSourceName: string
  ): MetadataModelMap[K] | undefined;
}
