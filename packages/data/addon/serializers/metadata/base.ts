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
import type { TimeDimensionMetadataPayload } from 'navi-data/models/metadata/time-dimension';
import type { DimensionMetadataPayload } from 'navi-data/models/metadata/dimension';
import type { MetricMetadataPayload } from 'navi-data/models/metadata/metric';
import type { ColumnFunctionMetadataPayload } from 'navi-data/models/metadata/column-function';
import type { TableMetadataPayload } from 'navi-data/models/metadata/table';
import type { RequestConstraintMetadataPayload } from 'navi-data/models/metadata/request-constraint';

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
  private metricFactory = getOwner(this).factoryFor('model:metadata/metric') as Factory<typeof MetricMetadataModel>;
  private dimensionFactory = getOwner(this).factoryFor('model:metadata/dimension') as Factory<
    typeof DimensionMetadataModel
  >;
  private timeDimensionFactory = getOwner(this).factoryFor('model:metadata/time-dimension') as Factory<
    typeof TimeDimensionMetadataModel
  >;
  private requestConstraintFactory = getOwner(this).factoryFor('model:metadata/request-constraint') as Factory<
    typeof RequestConstraintMetadataModel
  >;
  private tableFactory = getOwner(this).factoryFor('model:metadata/table') as Factory<typeof TableMetadataModel>;
  private columnFunctionFactory = getOwner(this).factoryFor('model:metadata/column-function') as Factory<
    typeof ColumnFunctionMetadataModel
  >;

  abstract normalize<K extends keyof MetadataModelMap>(
    type: K,
    rawPayload: RawMetadataPayload,
    dataSourceName: string
  ): MetadataModelMap[K] | undefined;

  protected createTableModel(payload: TableMetadataPayload): TableMetadataModel {
    return this.tableFactory.create(payload);
  }

  protected createTimeDimensionModel(payload: TimeDimensionMetadataPayload): TimeDimensionMetadataModel {
    return this.timeDimensionFactory.create(payload);
  }

  protected createDimensionModel(payload: DimensionMetadataPayload): DimensionMetadataModel {
    return this.dimensionFactory.create(payload);
  }

  protected createMetricModel(payload: MetricMetadataPayload): MetricMetadataModel {
    return this.metricFactory.create(payload);
  }

  protected createColumnFunctionModel(payload: ColumnFunctionMetadataPayload): ColumnFunctionMetadataModel {
    return this.columnFunctionFactory.create(payload);
  }

  protected createConstraintModel(payload: RequestConstraintMetadataPayload): RequestConstraintMetadataModel {
    return this.requestConstraintFactory.create(payload);
  }
}
