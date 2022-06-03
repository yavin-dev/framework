/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ColumnMetadataModel from './column.js';
import type { ColumnInstance, ColumnMetadataPayload, ColumnType } from './column.js';
import type { ResponseRow } from '../navi-fact-response.js';
import type { MetricValue } from '../../serializers/facts/interface.js';
import { ClientService, Injector } from '../native-with-create.js';
import FormatterService from '../../services/interfaces/formatter.js';

// Shape passed to model constructor
export interface MetricMetadataPayload extends ColumnMetadataPayload {
  defaultFormat?: string;
}

export type MetricColumn = ColumnInstance<MetricMetadataModel>;

export default class MetricMetadataModel extends ColumnMetadataModel {
  static identifierField = 'id';

  @ClientService('navi-formatter')
  protected declare formatter: FormatterService;

  constructor(injector: Injector, args: MetricMetadataPayload) {
    super(injector, args);
  }

  metadataType: ColumnType = 'metric';

  /**
   * e.g. decimal for numbers
   */
  declare defaultFormat?: string;

  formatValue(value: MetricValue, column: MetricColumn, row: ResponseRow, requestedFormat?: string): string {
    return this.formatter.formatMetricValue(value, column, row, requestedFormat);
  }

  /**
   * extended metadata for the metric that isn't provided in initial table fullView metadata load
   */
  get extended(): PromiseLike<MetricMetadataModel> {
    const { metadataService, id, source } = this;
    return metadataService.findById('metric', id, source).then((m) => m || this);
  }
}

declare module './registry' {
  export default interface MetadataModelRegistry {
    metric: MetricMetadataModel;
  }
}
