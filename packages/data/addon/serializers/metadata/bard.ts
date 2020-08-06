/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import config from 'ember-get-config';
import { constructFunctionParameters, normalizeColumnFunctions } from 'navi-data/serializers/metadata/column-function';
import { ColumnFunctionMetadataPayload } from '../../models/metadata/column-function';
import CARDINALITY_SIZES from '../../utils/enums/cardinality-sizes';
import { MetricMetadataPayload } from 'navi-data/models/metadata/metric';
import { DimensionMetadataPayload } from 'navi-data/models/metadata/dimension';
import TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';
import NaviMetadataSerializer, { MetadataPayloadMap, EverythingMetadataPayload } from './interface';
import { assert } from '@ember/debug';
import { ColumnFunctionParametersValues } from 'navi-data/models/metadata/function-parameter';

const LOAD_CARDINALITY = config.navi.searchThresholds.contains;
const MAX_LOAD_CARDINALITY = config.navi.searchThresholds.in;

type RawEverythingPayload = {
  tables: RawTablePayload[];
  metricFunctions?: RawColumnFunction[];
  source: string;
};

type RawDimensionPayload = {
  id: string;
  datatype: 'date';
  name: string;
  longName: string;
  category: string;
  storageStrategy: TODO;
  cardinality: number;
  fields: TODO;
};

type RawMetricPayload = {
  type: TODO;
  longName: string;
  name: string;
  category: string;
  metricFunctionId: string;
  parameters: RawColumnFunctionArguments;
};

export type RawColumnFunction = {
  id: string;
  name: string;
  description: string;
  arguments: RawColumnFunctionArguments;
};

export type RawColumnFunctionArguments = {
  [k: string]: RawColumnFunctionArgument;
};

export type RawColumnFunctionArgument = {
  type: 'enum' | 'dimension';
  defaultValue?: string;
  values?: ColumnFunctionParametersValues;
  dimensionName?: string;
  description?: string;
};

type RawTimeGrainPayload = {
  name: string;
  dimensions: RawDimensionPayload[];
  metrics: RawMetricPayload[];
};

type RawTablePayload = {
  timeGrains: RawTimeGrainPayload[];
  name: string;
  longName: string;
  description: string;
  category: string;
};

export default class BardMetadataSerializer extends EmberObject implements NaviMetadataSerializer {
  /**
   * Transform the bard metadata into a shape that our internal data models can use
   * @param rawPayload - object containing all metadata for a datasource
   * @param source - datasource of the payload
   * @returns normalized table object
   */
  _normalizeEverything(rawPayload: RawEverythingPayload): EverythingMetadataPayload {
    const { tables: rawTables, source, metricFunctions: rawColumnFunctions } = rawPayload;

    // build dimension and metric arrays
    const metrics: { [k: string]: MetricMetadataPayload } = {};
    const dimensions: { [k: string]: DimensionMetadataPayload } = {};
    const timeDimensions: { [k: string]: TimeDimensionMetadataModel } = {};
    const convertedToColumnFunctions: { [k: string]: ColumnFunctionMetadataPayload } = {};
    const tables = rawTables.map((table: RawTablePayload) => {
      // Reduce all columns regardless of timegrain into one object
      const allTableColumns = table.timeGrains.reduce(
        (acc, timegrain) => {
          const {
            metrics: currentMetrics,
            dimensions: currentDimensions,
            timeDimensions: currentTimeDimensions,
            tableMetricIds,
            tableDimensionIds,
            tableTimeDimensionIds
          } = acc;

          // Construct each dimension / time-dimension
          timegrain.dimensions.forEach(dimension => {
            const { datatype: valueType } = dimension;
            const accDimensionList = valueType === 'date' ? currentTimeDimensions : currentDimensions;
            const accTableDimensionList = valueType === 'date' ? tableTimeDimensionIds : tableDimensionIds;

            const newDim = this._constructDimension(dimension, source);
            const newDimCardinality = newDim.cardinality || CARDINALITY_SIZES[2];
            if (CARDINALITY_SIZES.indexOf(newDimCardinality) > CARDINALITY_SIZES.indexOf(acc.tableCardinality)) {
              acc.tableCardinality = newDimCardinality;
            }
            accDimensionList[newDim.id] = newDim; // Add dim to all dimensions list
            accTableDimensionList.add(newDim.id); // Add dim id to table's dimensionIds/timeDimensionIds list
          });

          // Construct each metric and metric function + function parameters if necessary
          timegrain.metrics.forEach((metric: RawMetricPayload) => {
            const convertedToColumnFunction = this._getColumnFunctionFromMetricParameters(metric, source);
            if (convertedToColumnFunction) {
              metric.metricFunctionId = convertedToColumnFunction.id;
              convertedToColumnFunctions[convertedToColumnFunction.id] = convertedToColumnFunction;
            }

            const newMetric = this._constructMetric(metric, source);
            currentMetrics[newMetric.id] = newMetric; // Add metric to all metrics list
            tableMetricIds.add(newMetric.id); // Add metric id to table's metricIds list
          });

          return acc;
        },
        {
          metrics,
          dimensions,
          timeDimensions,
          tableMetricIds: new Set<string>(),
          tableDimensionIds: new Set<string>(),
          tableTimeDimensionIds: new Set<string>(),
          tableCardinality: CARDINALITY_SIZES[0] as typeof CARDINALITY_SIZES[number]
        }
      );

      return {
        id: table.name,
        name: table.longName,
        description: table.description,
        category: table.category,
        cardinality: allTableColumns.tableCardinality,
        timeGrainIds: table.timeGrains.map(grain => grain.name),
        source,
        metricIds: [...allTableColumns.tableMetricIds],
        dimensionIds: [...allTableColumns.tableDimensionIds],
        timeDimensionIds: [...allTableColumns.tableTimeDimensionIds]
      };
    });

    const columnFunctions = rawColumnFunctions ? normalizeColumnFunctions(rawColumnFunctions, source) : [];

    return {
      tables,
      dimensions: Object.values(dimensions),
      metrics: Object.values(metrics),
      timeDimensions: Object.values(timeDimensions),
      columnFunctions: [...columnFunctions, ...Object.values(convertedToColumnFunctions)]
    };
  }

  _getColumnFunctionFromMetricParameters(
    metric: RawMetricPayload,
    source: string
  ): ColumnFunctionMetadataPayload | null {
    const { parameters, metricFunctionId } = metric;

    //only if just `parameters` exists, since metricId take precedence
    if (parameters && !metricFunctionId) {
      const newColumnFunction: ColumnFunctionMetadataPayload = {
        id: Object.keys(metric.parameters)
          .sort()
          .join('|'),
        name: '',
        description: '',
        _parametersPayload: constructFunctionParameters(parameters, source),
        source
      };
      return newColumnFunction;
    }
    return null;
  }

  _constructDimension(dimension: RawDimensionPayload, source: string): DimensionMetadataPayload {
    const { name, longName, category, datatype: valueType, storageStrategy, cardinality, fields } = dimension;

    let dimCardinality: typeof CARDINALITY_SIZES[number] = CARDINALITY_SIZES[0];
    if (cardinality > MAX_LOAD_CARDINALITY) {
      dimCardinality = CARDINALITY_SIZES[2];
    } else if (cardinality > LOAD_CARDINALITY) {
      dimCardinality = CARDINALITY_SIZES[1];
    }
    return {
      id: name,
      name: longName,
      category,
      valueType,
      type: 'field',
      fields,
      cardinality: dimCardinality,
      storageStrategy: storageStrategy || null,
      source,
      partialData: true
    };
  }

  _constructMetric(metric: RawMetricPayload, source: string): MetricMetadataPayload {
    const { type: valueType, longName, name, category, metricFunctionId } = metric;
    return {
      id: name,
      name: longName,
      type: 'field',
      valueType,
      source,
      category,
      partialData: true,
      columnFunctionId: metricFunctionId
    };
  }

  normalize<K extends keyof MetadataPayloadMap>(type: K, rawPayload: TODO): MetadataPayloadMap[K] {
    assert('BardMetadataSerializer only supports normalizing type `everything`', type === 'everything');
    const normalized: MetadataPayloadMap['everything'] = this._normalizeEverything(rawPayload);
    return normalized as MetadataPayloadMap[K];
  }
}
