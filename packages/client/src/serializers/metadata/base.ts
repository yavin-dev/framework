/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import TableMetadataModel from '../../models/metadata/table.js';
import MetricMetadataModel from '../../models/metadata/metric.js';
import DimensionMetadataModel from '../../models/metadata/dimension.js';
import TimeDimensionMetadataModel from '../../models/metadata/time-dimension.js';
import ColumnFunctionMetadataModel from '../../models/metadata/column-function.js';
import RequestConstraintMetadataModel from '../../models/metadata/request-constraint.js';
import type { TimeDimensionMetadataPayload } from '../../models/metadata/time-dimension.js';
import type { DimensionMetadataPayload } from '../../models/metadata/dimension.js';
import type { MetricMetadataPayload } from '../../models/metadata/metric.js';
import type { ColumnFunctionMetadataPayload } from '../../models/metadata/column-function.js';
import type { TableMetadataPayload } from '../../models/metadata/table.js';
import type { RequestConstraintMetadataPayload } from '../../models/metadata/request-constraint.js';
import type MetadataSerializer from '../../serializers/metadata/interface.js';
import type { MetadataModelMap, RawMetadataPayload } from '../../serializers/metadata/interface.js';
import NativeWithCreate, { getInjector } from '../../models/native-with-create.js';

export default abstract class NaviMetadataSerializer extends NativeWithCreate implements MetadataSerializer {
  abstract normalize<K extends keyof MetadataModelMap>(
    type: K,
    rawPayload: RawMetadataPayload,
    dataSourceName: string
  ): MetadataModelMap[K] | undefined;

  protected createTableModel(payload: TableMetadataPayload): TableMetadataModel {
    return new TableMetadataModel(getInjector(this), payload);
  }

  protected createTimeDimensionModel(payload: TimeDimensionMetadataPayload): TimeDimensionMetadataModel {
    return new TimeDimensionMetadataModel(getInjector(this), payload);
  }

  protected createDimensionModel(payload: DimensionMetadataPayload): DimensionMetadataModel {
    return new DimensionMetadataModel(getInjector(this), payload);
  }

  protected createMetricModel(payload: MetricMetadataPayload): MetricMetadataModel {
    return new MetricMetadataModel(getInjector(this), payload);
  }

  protected createColumnFunctionModel(payload: ColumnFunctionMetadataPayload): ColumnFunctionMetadataModel {
    return new ColumnFunctionMetadataModel(getInjector(this), payload);
  }

  protected createConstraintModel(payload: RequestConstraintMetadataPayload): RequestConstraintMetadataModel {
    return new RequestConstraintMetadataModel(getInjector(this), payload);
  }
}
