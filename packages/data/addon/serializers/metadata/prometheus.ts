/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviMetadataSerializer, { EverythingMetadataPayload, MetadataModelMap } from './base';
import { assert } from '@ember/debug';
import { capitalize } from '@ember/string';
import { INTRINSIC_VALUE_EXPRESSION } from 'navi-data/models/metadata/function-parameter';
import type TableMetadataModel from 'navi-data/models/metadata/table';
import type { TableMetadataPayload } from 'navi-data/models/metadata/table';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { DimensionMetadataPayload } from 'navi-data/models/metadata/dimension';
import type MetricMetadataModel from 'navi-data/models/metadata/metric';
import type { MetricMetadataPayload } from 'navi-data/models/metadata/metric';
import type TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';
import type { TimeDimensionMetadataPayload } from 'navi-data/models/metadata/time-dimension';
import type ColumnFunctionMetadataModel from 'navi-data/models/metadata/column-function';
import type { ColumnFunctionMetadataPayload } from 'navi-data/models/metadata/column-function';
import type { Grain } from 'navi-data/utils/date';
import type RequestConstraintMetadataModel from 'navi-data/models/metadata/request-constraint';
import type { RequestConstraintMetadataPayload } from 'navi-data/models/metadata/request-constraint';

export type Payload<Response = unknown> = {
  status: string;
  data: Response;
};

type DimensionsPayload = Payload<string[]>;
type MetricPayload = Payload<Record<string, { type: string; help: string; unit: string }[]>>;
type EverythingPayload = {
  tables: ['default'];
  metrics: MetricPayload;
  dimensions: DimensionsPayload;
};

export default class PrometheusMetadataSerializer extends NaviMetadataSerializer {
  private namespace = 'normalizer-generated';
  private supportedTypes = new Set<keyof MetadataModelMap>(['everything']);

  protected normalizeEverything(rawPayload: EverythingPayload, dataSourceName: string): EverythingMetadataPayload {
    const timeDimensionColumnFunction = this.createTimeGrainColumnFunction(['second'], dataSourceName);
    const timeDimension = this.createTimeDimension('time', dataSourceName);
    const timeDimensionConstraint = this.createRequiredDateTimeColumnConstraint(timeDimension, dataSourceName);
    timeDimension.columnFunctionId = timeDimensionColumnFunction.id;
    const timeDimensions = [timeDimension];

    const metrics = this.normalizeMetrics(rawPayload.metrics, dataSourceName);
    const dimensions = this.normalizeDimensions(rawPayload.dimensions, dataSourceName);

    const table = this.createTable(rawPayload.tables[0], dataSourceName, metrics, dimensions, timeDimensions);
    return {
      tables: [table],
      timeDimensions: timeDimensions,
      dimensions: dimensions,
      metrics: metrics,
      requestConstraints: [timeDimensionConstraint],
      columnFunctions: [timeDimensionColumnFunction],
    };
  }

  protected createTimeDimension(name: string, dataSourceName: string): TimeDimensionMetadataModel {
    const payload: TimeDimensionMetadataPayload = {
      name,
      id: name,
      timeZone: 'UTC',
      category: 'Time',
      isSortable: false,
      supportedGrains: [{ id: 'second', grain: 'second', expression: '' }],
      valueType: 'date',
      type: 'field',
      source: dataSourceName,
      cardinality: 'SMALL',
    };
    return this.timeDimensionFactory.create(payload);
  }

  /**
   * Creates a column function to select the time grains from a given table
   * @param table - the table to create a dateTime for
   * @param dataSourceName - data source name
   */
  private createTimeGrainColumnFunction(grains: Grain[], dataSourceName: string): ColumnFunctionMetadataModel {
    const columnFunctionId = `${this.namespace}:timeGrain(grains=${grains.join(',')})`;
    const payload: ColumnFunctionMetadataPayload = {
      id: columnFunctionId,
      name: 'Time Grain',
      source: dataSourceName,
      description: 'Time Grain',
      _parametersPayload: [
        {
          id: 'grain',
          name: 'Time Grain',
          description: 'The time grain to group dates by',
          source: dataSourceName,
          type: 'ref',
          expression: INTRINSIC_VALUE_EXPRESSION,
          defaultValue: grains[0],
          _localValues: grains.map((grain) => ({
            id: grain,
            description: grain,
            name: capitalize(grain),
          })),
        },
      ],
    };
    return this.columnFunctionFactory.create(payload);
  }

  /**
   * Constructs a request constraint that requires a date time column
   * @param table - the table to create a dateTime for
   * @param dataSourceName - data source name
   */
  private createRequiredDateTimeColumnConstraint(
    timeDimension: TimeDimensionMetadataModel,
    dataSourceName: string
  ): RequestConstraintMetadataModel {
    const payload: RequestConstraintMetadataPayload = {
      id: `${this.namespace}:requestConstraint(columns=${timeDimension.id})`,
      name: 'Time Column',
      description: `The request has a Time column.`,
      source: dataSourceName,
      type: 'existence',
      constraint: {
        property: 'columns',
        matches: {
          type: 'timeDimension',
          field: timeDimension.id,
        },
      },
    };
    return this.requestConstraintFactory.create(payload);
  }

  protected createTable(
    name: string,
    dataSourceName: string,
    metrics: MetricMetadataModel[],
    dimensions: DimensionMetadataModel[],
    timeDimensions: TimeDimensionMetadataPayload[]
  ): TableMetadataModel {
    const payload: TableMetadataPayload = {
      name,
      id: name,
      isFact: true,
      dimensionIds: dimensions.map((d) => d.id),
      metricIds: metrics.map((m) => m.id),
      source: dataSourceName,
      requestConstraintIds: [],
      timeDimensionIds: timeDimensions.map((t) => t.id),
      cardinality: 'SMALL',
    };
    return this.tableFactory.create(payload);
  }

  protected normalizeMetrics(metrics: MetricPayload, dataSourceName: string): MetricMetadataModel[] {
    return Object.entries(metrics.data).map(([metricName, metricInfos]) => {
      const metricInfo = metricInfos[0];
      const [category, ...rest] = metricName.split('_');
      const payload: MetricMetadataPayload = {
        type: 'field',
        valueType: 'number',
        isSortable: false,
        name: capitalize(rest.join(' ')),
        id: metricName,
        category: capitalize(category),
        description: metricInfo.help,
        source: dataSourceName,
      };
      return this.metricFactory.create(payload);
    });
  }

  protected normalizeDimensions(dimensions: DimensionsPayload, dataSourceName: string): DimensionMetadataModel[] {
    return dimensions.data.map((dimension) => {
      const payload: DimensionMetadataPayload = {
        type: 'field',
        isSortable: false,
        valueType: 'text',
        cardinality: 'SMALL',
        name: dimension,
        id: dimension,
        source: dataSourceName,
      };
      return this.dimensionFactory.create(payload);
    });
  }

  normalize<K extends keyof MetadataModelMap>(
    type: K,
    rawPayload: EverythingPayload,
    dataSourceName: string
  ): MetadataModelMap[K] {
    assert(
      `PrometheusMetadataSerializer only supports normalizing type: ${[...this.supportedTypes]}`,
      this.supportedTypes.has(type)
    );

    const normalized: MetadataModelMap['everything'] = this.normalizeEverything(rawPayload, dataSourceName);
    return normalized as MetadataModelMap[K];
  }
}
