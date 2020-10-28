/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import TableMetadataModel from 'navi-data/models/metadata/table';
import MetricMetadataModel from 'navi-data/models/metadata/metric';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';
import ColumnFunctionMetadataModel from 'navi-data/models/metadata/column-function';
import { getOwner } from '@ember/application';

export interface EverythingMetadataPayload {
  tables: TableMetadataModel[];
  metrics: MetricMetadataModel[];
  dimensions: DimensionMetadataModel[];
  timeDimensions: TimeDimensionMetadataModel[];
  columnFunctions?: ColumnFunctionMetadataModel[];
}

export interface MetadataModelMap {
  everything: EverythingMetadataPayload;
  table: TableMetadataModel[];
  metric: MetricMetadataModel[];
  dimension: DimensionMetadataModel[];
  timeDimension: TimeDimensionMetadataModel[];
  columnFunction: ColumnFunctionMetadataModel[];
}

export type RawMetadataPayload = unknown;

export default abstract class NaviMetadataSerializer extends EmberObject {
  protected metricFactory = getOwner(this).factoryFor('model:metadata/metric');
  protected dimensionFactory = getOwner(this).factoryFor('model:metadata/dimension');
  protected timeDimensionFactory = getOwner(this).factoryFor('model:metadata/time-dimension');
  protected tableFactory = getOwner(this).factoryFor('model:metadata/table');
  protected columnFunctionFactory = getOwner(this).factoryFor('model:metadata/column-function');

  abstract normalize<K extends keyof MetadataModelMap>(
    type: K,
    rawPayload: RawMetadataPayload,
    dataSourceName: string
  ): MetadataModelMap[K] | undefined;
}
