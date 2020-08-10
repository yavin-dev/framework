/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ColumnMetadataModel, { ColumnMetadata, ColumnMetadataPayload } from './column';

// Shape of public properties on model
export interface MetricMetadata extends ColumnMetadata {
  defaultFormat?: string;
  extended: Promise<MetricMetadataModel | undefined>;
}
// Shape passed to model constructor
export interface MetricMetadataPayload extends ColumnMetadataPayload {
  defaultFormat?: string;
}

export default class MetricMetadataModel extends ColumnMetadataModel implements MetricMetadata, MetricMetadataPayload {
  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {string} defaultFormat - e.g. decimal for numbers
   */
  defaultFormat?: string;

  /**
   * @property {Promise} extended - extended metadata for the metric that isn't provided in initial table fullView metadata load
   */
  get extended(): Promise<MetricMetadataModel> {
    const { naviMetadata, id, source } = this;
    return naviMetadata.findById('metric', id, source).then(m => m || this);
  }
}

declare module './registry' {
  export default interface MetadataModelRegistry {
    metric: MetricMetadataModel;
  }
}
