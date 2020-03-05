/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard metadata
 */

import { guidFor } from '@ember/object/internals';
import { INTRINSIC_VALUE_EXPRESSION } from 'navi-data/models/metadata/metric/function-argument';
import EmberObject from '@ember/object';

export default EmberObject.extend({
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
    let metrics = [],
      dimensions = [],
      timeDimensions = [],
      metricFunctions = new Set(),
      tables = rawTables.map(table => {
        // Reduce all columns regardless of timegrain into one object
        const allTableColumns = table.timeGrains.reduce(
          (acc, timegrain) => {
            const { name: grain } = timegrain;
            const {
              metrics: currentMetrics,
              dimensions: currentDimensions,
              timeDimensions: currentTimeDimensions
            } = acc;

            // Construct each dimension / time-dimension
            timegrain.dimensions.forEach(dimension => {
              const { datatype: valueType, name } = dimension;
              const accDimensionList = valueType === 'date' ? currentTimeDimensions : currentDimensions;

              accDimensionList[name] = this._constructDimension(dimension, grain, source, table.name, accDimensionList);
            });

            // Construct each metric and metric function + function arguments if necessary
            timegrain.metrics.forEach(metric => {
              const {
                metric: newMetric,
                metricFunction: newMetricFunction,
                metricFunctionsProvided
              } = this._constructMetric(metric, grain, source, table.name, currentMetrics, metricFunctions);
              currentMetrics[metric.name] = newMetric;

              if (metricFunctionsProvided) {
                metricFunctions = null;
              }

              if (newMetricFunction) {
                metricFunctions.add(newMetricFunction);
              }
            });

            return acc;
          },
          { metrics: {}, dimensions: {}, timeDimensions: {} }
        );

        // Add metrics and dimensions for the table to the overall metrics and dimensions arrays
        metrics = metrics.concat(Object.values(allTableColumns.metrics));
        dimensions = dimensions.concat(Object.values(allTableColumns.dimensions));
        timeDimensions = timeDimensions.concat(Object.values(allTableColumns.timeDimensions));

        return {
          id: table.name,
          name: table.longName,
          description: table.description,
          category: table.category,
          source,
          metricIds: Object.keys(allTableColumns.metrics),
          dimensionIds: Object.keys(allTableColumns.dimensions),
          timeDimensionIds: Object.keys(allTableColumns.timeDimensions)
        };
      });

    return {
      tables,
      dimensions,
      metrics,
      timeDimensions,
      metricFunctions: metricFunctions ? [...metricFunctions] : null // Set -> Array
    };
  },

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
      const metricFunctionArgumentIds = func.arguments.map(metricFunctionArg => metricFunctionArg.id).join(',');
      if (functionArgs.map(arg => arg.id).join(',') === metricFunctionArgumentIds) {
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
  },

  /**
   * @private
   * @method _constructFunctionArguments
   * @param {Object} parameters - map of parameter objects to turn into function arguments
   * @returns {Object[]} array of function argument objects
   */
  _constructFunctionArguments(parameters) {
    return Object.keys(parameters).map(param => {
      const paramObj = parameters[param];
      const { type, defaultValue, values, dimensionName } = paramObj;

      return {
        id: param,
        name: param,
        valueType: 'TEXT',
        type: 'ref', // It will always be ref for our case because all our parameters have their valid values defined in a dimension or enum
        expression: type === 'dimension' ? `dimension:${dimensionName}` : INTRINSIC_VALUE_EXPRESSION,
        values: values || null,
        defaultValue
      };
    });
  },

  /**
   * @private
   * @method _constructDimension
   * @param {Object} dimension
   * @param {String} grain
   * @param {String} source
   * @param {String} tableName
   * @param {Object} currentDimensions
   * @returns {Object} dimension object newly created or existing dimension with an added timegrain
   */

  _constructDimension(dimension, grain, source, tableName, currentDimensions) {
    let newDimension;
    const { name, longName, category, datatype: valueType, storageStrategy } = dimension;
    const existingDimension = currentDimensions[name];

    if (existingDimension) {
      const newGrains = [...existingDimension.timegrains, grain];
      newDimension = Object.assign({}, existingDimension, { timegrains: newGrains });
    } else {
      newDimension = {
        id: name,
        name: longName,
        category,
        valueType,
        type: 'field',
        storageStrategy: storageStrategy || null,
        source,
        tableId: tableName,
        timegrains: [grain]
      };
    }

    return newDimension;
  },

  /**
   * @private
   * @method _constructMetric
   * @param {Object} metric
   * @param {String} grain
   * @param {String} source
   * @param {String} tableName
   * @param {Object} currentMetrics
   * @param {Set<Object>} metricFunctions
   * @returns {Object} created or existing metric object with applicable timegrains,
   * possibly created metric function object, and flag on whether a provided metric id was found
   */
  _constructMetric(metric, grain, source, tableName, currentMetrics, metricFunctions) {
    let newMetric,
      newMetricFunction = null,
      metricFunctionsProvided = false;
    const { type: valueType, longName, name, category, parameters, metricFunctionId } = metric;
    const existingMetric = currentMetrics[name];

    if (existingMetric) {
      const newGrains = [...existingMetric.timegrains, grain];
      newMetric = Object.assign({}, existingMetric, { timegrains: newGrains });
    } else {
      newMetric = {
        id: name,
        name: longName,
        valueType,
        source,
        category,
        tableId: tableName,
        timegrains: [grain]
      };
      /*
       * If Fili provides a metric function id, then we can look up the parameter metadata later in the metricFunctions endpoint
       * If it does not provide a metric function id and parameters are present, we derive a metric function object in our own dictionary
       */
      if (metricFunctionId) {
        newMetric.metricFunctionId = metricFunctionId;
        metricFunctionsProvided = true;
      } else if (parameters && metricFunctions) {
        const functionArguments = this._constructFunctionArguments(parameters);
        const metricFunction = this._getMetricFunction(metricFunctions, functionArguments, source);

        newMetric.metricFunctionId = metricFunction.id;
        newMetricFunction = metricFunction;
      }
    }

    return { metric: newMetric, metricFunction: newMetricFunction, metricFunctionsProvided };
  },

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
});
