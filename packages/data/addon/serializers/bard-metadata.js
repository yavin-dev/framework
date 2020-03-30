/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard metadata
 */

import EmberObject from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { constructFunctionArguments } from 'navi-data/serializers/metadata/metric-function';
import { CARDINALITY_SIZES } from 'navi-data/models/metadata/dimension';
import config from 'ember-get-config';

const LOAD_CARDINALITY = config.navi.searchThresholds.contains;
const MAX_LOAD_CARDINALITY = config.navi.searchThresholds.in;

export default class BardMetadataSerializer extends EmberObject {
  /**
   * Transform the bard metadata into a shape that our internal data models can use
   * @private
   * @method _normalizeTable - normalizes the table object
   * @param {Object[]} rawTables - array of table objects
   * @param {String} source - datasource of the payload
   * @returns {Object} - normalized table object
   */
  _normalizeTable(rawTables, source) {
    // build dimension and metric arrays
    let metrics = {},
      dimensions = {},
      timeDimensions = {},
      metricFunctions = new Set(),
      tables = rawTables.map(table => {
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

              const newDim = this._constructDimension(dimension, source, table.name, accDimensionList);
              if (CARDINALITY_SIZES.indexOf(newDim.cardinality) > CARDINALITY_SIZES.indexOf(acc.tableCardinality)) {
                acc.tableCardinality = newDim.cardinality;
              }
              accDimensionList[newDim.id] = newDim; // Add dim to all dimensions list
              accTableDimensionList.add(newDim.id); // Add dim id to table's dimensionIds/timeDimensionIds list
            });

            // Construct each metric and metric function + function arguments if necessary
            timegrain.metrics.forEach(metric => {
              const {
                metric: newMetric,
                metricFunction: newMetricFunction,
                metricFunctionsProvided
              } = this._constructMetric(metric, source, table.name, currentMetrics, metricFunctions);

              currentMetrics[newMetric.id] = newMetric; // Add metric to all metrics list
              tableMetricIds.add(newMetric.id); // Add metric id to table's metricIds list

              if (metricFunctionsProvided) {
                metricFunctions = null;
              }

              if (newMetricFunction) {
                metricFunctions.add(newMetricFunction);
              }
            });

            return acc;
          },
          {
            metrics,
            dimensions,
            timeDimensions,
            tableMetricIds: new Set(),
            tableDimensionIds: new Set(),
            tableTimeDimensionIds: new Set(),
            tableCardinality: CARDINALITY_SIZES[0]
          }
        );

        return {
          id: table.name,
          name: table.longName,
          description: table.description,
          category: table.category,
          cardinalitySize: allTableColumns.tableCardinality,
          timeGrainIds: table.timeGrains.map(grain => grain.name),
          source,
          metricIds: [...allTableColumns.tableMetricIds],
          dimensionIds: [...allTableColumns.tableDimensionIds],
          timeDimensionIds: [...allTableColumns.tableTimeDimensionIds]
        };
      });

    return {
      tables,
      dimensions: Object.values(dimensions),
      metrics: Object.values(metrics),
      timeDimensions: Object.values(timeDimensions),
      metricFunctions: metricFunctions ? [...metricFunctions] : null // Set -> Array
    };
  }

  /**
   * @private
   * @method _getMetricFunction
   * @param {Set<Object>} metricFunctions - the current dictionary of metric functions
   * @param {Object[]} functionArgs - the set of function argument objects to find or create a metric function for
   * @param {String} source - datasource the payload is from
   * @returns {Object} the existing metric function with the same arguments or a new metric function with passed in arguments
   */
  _getMetricFunction(metricFunctions, functionArgs, source) {
    //Check for an existing metric function in the set
    for (const func of metricFunctions) {
      const metricFunctionArgumentIds = func.arguments
        .map(metricFunctionArg => metricFunctionArg.id)
        .sort()
        .join(',');
      if (
        functionArgs
          .map(arg => arg.id)
          .sort()
          .join(',') === metricFunctionArgumentIds
      ) {
        return func;
      }
    }

    const newMetricFunction = {
      name: '',
      description: '',
      arguments: functionArgs,
      source
    };
    newMetricFunction.id = guidFor(newMetricFunction);

    return newMetricFunction;
  }

  /**
   * @private
   * @method _constructDimension
   * @param {Object} dimension
   * @param {String} source
   * @param {String} tableName
   * @param {Object} currentDimensions
   * @returns {Object} dimension object newly created or existing dimension with an added timegrain
   */
  _constructDimension(dimension, source, tableName, currentDimensions) {
    let newDimension;
    const { name, longName, category, datatype: valueType, storageStrategy, cardinality, fields } = dimension;
    const existingDimension = currentDimensions[name];

    if (existingDimension) {
      const newTableIds = new Set([...existingDimension.tableIds, tableName]);
      newDimension = Object.assign({}, existingDimension, { tableIds: [...newTableIds] });
    } else {
      let dimCardinality = CARDINALITY_SIZES[0];
      if (cardinality > MAX_LOAD_CARDINALITY) {
        dimCardinality = CARDINALITY_SIZES[2];
      } else if (cardinality > LOAD_CARDINALITY) {
        dimCardinality = CARDINALITY_SIZES[1];
      }
      newDimension = {
        id: name,
        name: longName,
        category,
        valueType,
        type: 'field',
        fields,
        cardinality: dimCardinality,
        storageStrategy: storageStrategy || null,
        source,
        tableIds: [tableName],
        partialData: true
      };
    }

    return newDimension;
  }

  /**
   * @private
   * @method _constructMetric
   * @param {Object} metric
   * @param {String} source
   * @param {String} tableName
   * @param {Object} currentMetrics
   * @param {Set<Object>} metricFunctions
   * @returns {Object} created or existing metric object with applicable timegrains,
   * possibly created metric function object, and flag on whether a provided metric id was found
   */
  _constructMetric(metric, source, tableName, currentMetrics, metricFunctions) {
    let newMetric,
      newMetricFunction = null,
      metricFunctionsProvided = false;
    const { type: valueType, longName, name, category, parameters, metricFunctionId } = metric;
    const existingMetric = currentMetrics[name];

    if (existingMetric) {
      const newTableIds = new Set([...existingMetric.tableIds, tableName]);
      newMetric = Object.assign({}, existingMetric, { tableIds: [...newTableIds] });
    } else {
      newMetric = {
        id: name,
        name: longName,
        valueType,
        source,
        category,
        tableIds: [tableName],
        partialData: true
      };
      /*
       * If Fili provides a metric function id, then we can look up the parameter metadata later in the metricFunctions endpoint
       * If it does not provide a metric function id and parameters are present, we derive a metric function object in our own dictionary
       */
      if (metricFunctionId) {
        newMetric.metricFunctionId = metricFunctionId;
        metricFunctionsProvided = true;
      } else if (parameters && metricFunctions) {
        const functionArguments = constructFunctionArguments(parameters);
        const metricFunction = this._getMetricFunction(metricFunctions, functionArguments, source);

        newMetric.metricFunctionId = metricFunction.id;
        newMetricFunction = metricFunction;
      }
    }

    return { metric: newMetric, metricFunction: newMetricFunction, metricFunctionsProvided };
  }

  /**
   * @method normalize - normalizes the JSON response
   * @param response {Object} - JSON response object
   * @returns {Object} - normalized JSON object
   */
  normalize(payload) {
    if (payload && payload.tables) {
      return this._normalizeTable(payload.tables, payload.source);
    }
  }
}
