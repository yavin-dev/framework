/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import config from 'ember-get-config';
import { constructFunctionArguments, normalizeMetricFunctions } from 'navi-data/serializers/metadata/metric-function';
import { MetricFunctionMetadataPayload } from '../../models/metadata/metric-function';
import CARDINALITY_SIZES from '../../utils/enums/cardinality-sizes';
import { MetricMetadataPayload } from 'navi-data/models/metadata/metric';
import { DimensionMetadataPayload } from 'navi-data/models/metadata/dimension';
import TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';
import NaviMetadataSerializer, { MetadataPayloadMap, EverythingMetadataPayload } from './interface';
import { assert } from '@ember/debug';
import { MetricFunctionArgumentsValues } from 'navi-data/models/metadata/function-argument';

const LOAD_CARDINALITY = config.navi.searchThresholds.contains;
const MAX_LOAD_CARDINALITY = config.navi.searchThresholds.in;

type RawEverythingPayload = {
  tables: RawTablePayload[];
  metricFunctions?: RawMetricFunction[];
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
  parameters: RawMetricFunctionArguments;
};

export type RawMetricFunction = {
  id: string;
  name: string;
  description: string;
  arguments: RawMetricFunctionArguments;
};

export type RawMetricFunctionArguments = {
  [k: string]: RawMetricFunctionArgument;
};

export type RawMetricFunctionArgument = {
  type: 'enum' | 'dimension';
  defaultValue?: string;
  values?: MetricFunctionArgumentsValues;
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
    const { tables: rawTables, source, metricFunctions: rawMetricFunctions } = rawPayload;

    // build dimension and metric arrays
    const metrics: { [k: string]: MetricMetadataPayload } = {};
    const dimensions: { [k: string]: DimensionMetadataPayload } = {};
    const timeDimensions: { [k: string]: TimeDimensionMetadataModel } = {};
    const convertedToMetricFunctions: { [k: string]: MetricFunctionMetadataPayload } = {};
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

          // Construct each metric and metric function + function arguments if necessary
          timegrain.metrics.forEach((metric: RawMetricPayload) => {
            const convertedToMetricFunction = this._getMetricFunctionFromParameters(metric, source);
            if (convertedToMetricFunction) {
              metric.metricFunctionId = convertedToMetricFunction.id;
            }

            const newMetric = this._constructMetric(metric, source);
            currentMetrics[newMetric.id] = newMetric; // Add metric to all metrics list
            tableMetricIds.add(newMetric.id); // Add metric id to table's metricIds list

            if (convertedToMetricFunction) {
              convertedToMetricFunctions[convertedToMetricFunction.id] = convertedToMetricFunction;
            }
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

    const metricFunctions = rawMetricFunctions ? normalizeMetricFunctions(rawMetricFunctions, source) : [];

    return {
      tables,
      dimensions: Object.values(dimensions),
      metrics: Object.values(metrics),
      timeDimensions: Object.values(timeDimensions),
      metricFunctions: [...metricFunctions, ...Object.values(convertedToMetricFunctions)]
    };
  }

  _getMetricFunctionFromParameters(metric: RawMetricPayload, source: string): MetricFunctionMetadataPayload | null {
    const { parameters, metricFunctionId } = metric;

    //only if just `parameters` exists, since metricId take precedence
    if (parameters && !metricFunctionId) {
      const newMetricFunction: MetricFunctionMetadataPayload = {
        id: Object.keys(metric.parameters)
          .sort()
          .join('|'),
        name: '',
        description: '',
        arguments: constructFunctionArguments(parameters, source),
        source
      };
      return newMetricFunction;
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
      metricFunctionId
    };
  }

  normalize<K extends keyof MetadataPayloadMap>(type: K, rawPayload: TODO): MetadataPayloadMap[K] {
    assert('BardMetadataSerializer only supports normalizing type `everything`', type === 'everything');
    const normalized: MetadataPayloadMap['everything'] = this._normalizeEverything(rawPayload);
    return normalized as MetadataPayloadMap[K];
  }
}
