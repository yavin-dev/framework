/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ColumnMetadataModel from 'navi-data/models/metadata/column';
import type { ColumnInstance, ColumnMetadataPayload, ColumnType } from 'navi-data/models/metadata/column';

// Shape passed to model constructor
export interface MetricMetadataPayload extends ColumnMetadataPayload {
  defaultFormat?: string;
}

export type MetricColumn = ColumnInstance<MetricMetadataModel>;

export default class MetricMetadataModel extends ColumnMetadataModel {
  static identifierField = 'id';
  constructor(owner: unknown, args: MetricMetadataPayload) {
    super(owner, args);
  }

  metadataType: ColumnType = 'metric';

  /**
   * e.g. decimal for numbers
   */
  declare defaultFormat?: string;

  /**
   * extended metadata for the metric that isn't provided in initial table fullView metadata load
   */
  get extended(): Promise<MetricMetadataModel> {
    const { naviMetadata, id, source } = this;
    return naviMetadata.findById('metric', id, source).then((m) => m || this);
  }
}

declare module 'navi-data/models/metadata/registry' {
  export default interface MetadataModelRegistry {
    metric: MetricMetadataModel;
  }
}
