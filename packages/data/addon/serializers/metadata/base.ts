/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import TableMetadataModel from '@yavin/client/models/metadata/table';
import MetricMetadataModel from '@yavin/client/models/metadata/metric';
import DimensionMetadataModel from '@yavin/client/models/metadata/dimension';
import TimeDimensionMetadataModel from '@yavin/client/models/metadata/time-dimension';
import ColumnFunctionMetadataModel from '@yavin/client/models/metadata/column-function';
import RequestConstraintMetadataModel from '@yavin/client/models/metadata/request-constraint';
import type { TimeDimensionMetadataPayload } from '@yavin/client/models/metadata/time-dimension';
import type { DimensionMetadataPayload } from '@yavin/client/models/metadata/dimension';
import type { MetricMetadataPayload } from '@yavin/client/models/metadata/metric';
import type { ColumnFunctionMetadataPayload } from '@yavin/client/models/metadata/column-function';
import type { TableMetadataPayload } from '@yavin/client/models/metadata/table';
import type { RequestConstraintMetadataPayload } from '@yavin/client/models/metadata/request-constraint';
import type ClientInjector from 'navi-data/services/client-injector';

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
  abstract normalize<K extends keyof MetadataModelMap>(
    type: K,
    rawPayload: RawMetadataPayload,
    dataSourceName: string
  ): MetadataModelMap[K] | undefined;

  @service
  declare clientInjector: ClientInjector;

  protected createTableModel(payload: TableMetadataPayload): TableMetadataModel {
    return new TableMetadataModel(this.clientInjector, payload);
  }

  protected createTimeDimensionModel(payload: TimeDimensionMetadataPayload): TimeDimensionMetadataModel {
    return new TimeDimensionMetadataModel(this.clientInjector, payload);
  }

  protected createDimensionModel(payload: DimensionMetadataPayload): DimensionMetadataModel {
    return new DimensionMetadataModel(this.clientInjector, payload);
  }

  protected createMetricModel(payload: MetricMetadataPayload): MetricMetadataModel {
    return new MetricMetadataModel(this.clientInjector, payload);
  }

  protected createColumnFunctionModel(payload: ColumnFunctionMetadataPayload): ColumnFunctionMetadataModel {
    return new ColumnFunctionMetadataModel(this.clientInjector, payload);
  }

  protected createConstraintModel(payload: RequestConstraintMetadataPayload): RequestConstraintMetadataModel {
    return new RequestConstraintMetadataModel(this.clientInjector, payload);
  }
}
