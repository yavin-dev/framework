/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import type TableMetadataModel from 'navi-data/models/metadata/table';
import type MetricMetadataModel from 'navi-data/models/metadata/metric';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';
import type ColumnFunctionMetadataModel from 'navi-data/models/metadata/column-function';
import type RequestConstraintMetadataModel from 'navi-data/models/metadata/request-constraint';
import type { Factory } from 'navi-data/models/native-with-create';

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

export default abstract class NaviMetadataSerializer extends EmberObject {
  protected metricFactory = getOwner(this).factoryFor('model:metadata/metric') as Factory<typeof MetricMetadataModel>;
  protected dimensionFactory = getOwner(this).factoryFor('model:metadata/dimension') as Factory<
    typeof DimensionMetadataModel
  >;
  protected timeDimensionFactory = getOwner(this).factoryFor('model:metadata/time-dimension') as Factory<
    typeof TimeDimensionMetadataModel
  >;
  protected requestConstraintFactory = getOwner(this).factoryFor('model:metadata/request-constraint') as Factory<
    typeof RequestConstraintMetadataModel
  >;
  protected tableFactory = getOwner(this).factoryFor('model:metadata/table') as Factory<typeof TableMetadataModel>;
  protected columnFunctionFactory = getOwner(this).factoryFor('model:metadata/column-function') as Factory<
    typeof ColumnFunctionMetadataModel
  >;

  abstract normalize<K extends keyof MetadataModelMap>(
    type: K,
    rawPayload: RawMetadataPayload,
    dataSourceName: string
  ): MetadataModelMap[K] | undefined;
}
