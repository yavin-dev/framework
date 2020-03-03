/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard metadata
 */

import { guidFor } from '@ember/object/internals';
import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * Transform the bard metadata into a shape that our internal data models can use
   * @method _normalizeTable - normalizes the table object
   * @param rawTables {Array} - array of table objects
   * @returns {Object} - normalized table object
   */
  _normalizeTable(rawTables, source) {
    // build dimension and metric arrays
    let metrics = [],
      dimensions = [],
      timeDimensions = [],
      metricFunctions = new Set(),
      metricFunctionsProvided = false, //Will be set to true if a metric is found to have a metricFunctionId field
      tables = rawTables.map(table => {
        const newTable = {
          id: table.name,
          name: table.longName,
          description: table.description,
          category: table.category,
          source
        };

        // Reduce all columns regardless of timegrain into one object
        const allTableColumns = table.timeGrains.reduce(
          (acc, timegrain) => {
            const grain = timegrain.name;
            const currentMetrics = acc.metrics;
            const currentDimensions = acc.dimensions;
            const currentTimeDimensions = acc.timeDimensions;

            // Construct each dimension / time-dimension
            timegrain.dimensions.forEach(dimension => {
              const { name, longName, category, datatype: valueType, storageStrategy } = dimension;
              const accDimensionList = valueType === 'date' ? currentTimeDimensions : currentDimensions;

              const existingDimension = accDimensionList[name];
              if (existingDimension) {
                accDimensionList[name].timegrains.push(grain);
              } else {
                accDimensionList[name] = {
                  id: name,
                  name: longName,
                  category,
                  valueType,
                  storageStrategy: storageStrategy || null,
                  source,
                  tableId: table.name,
                  timegrains: [grain]
                };
              }
            });

            // Construct each metric and metric function + function arguments if necessary
            timegrain.metrics.forEach(metric => {
              const { type: valueType, longName, name, category, parameters, metricFunctionId } = metric;
              const existingMetric = currentMetrics[name];

              if (existingMetric) {
                currentMetrics[name].timegrains.push(grain);
              } else {
                const newMetric = {
                  id: name,
                  name: longName,
                  valueType,
                  source,
                  category,
                  tableId: table.name,
                  timegrains: [grain]
                };
                /*
                 * If Fili provides a metric function id, then we can look up the parameter metadata later in the metricFunctions endpoint
                 * If it does not provide a metric function id and parameters are present, we derive a metric function object in our own dictionary
                 */
                if (metricFunctionId) {
                  metricFunctionsProvided = true;
                  metricFunctions = null; // set the internal dictionary to null so that we know to use the endpoint later
                  newMetric.metricFunctionId = metricFunctionId;
                } else if (!metricFunctionsProvided && parameters) {
                  const functionArguments = this._constructFunctionArguments(parameters);
                  const metricFunction = this._getMetricFunction(metricFunctions, functionArguments);

                  newMetric.metricFunctionId = metricFunction.id;
                  metricFunctions.add(metricFunction);
                }

                currentMetrics[name] = newMetric;
              }
            });

            return acc;
          },
          { metrics: {}, dimensions: {}, timeDimensions: {} }
        );

        // Add the ids of each metrics and dimension to the table
        newTable.metricIds = Object.keys(allTableColumns.metrics);
        newTable.dimensionIds = Object.keys(allTableColumns.dimensions);
        newTable.timeDimensionIds = Object.keys(allTableColumns.timeDimensions);

        // Add metrics and dimensions for the table to the overall metrics and dimensions arrays
        metrics = metrics.concat(Object.values(allTableColumns.metrics));
        dimensions = dimensions.concat(Object.values(allTableColumns.dimensions));
        timeDimensions = timeDimensions.concat(Object.values(allTableColumns.timeDimensions));

        return newTable;
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
   * @returns {Object} the existing metric function with the same arguments or a new metric function with passed in arguments
   */
  _getMetricFunction(metricFunctions, functionArgs) {
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
      arguments: functionArgs
    };
    newMetricFunction.id = guidFor(newMetricFunction);

    return newMetricFunction;
  },

  /**
   * @private
   * @method _constructFunctionArguments
   * @param {Object} parameters - map of parameter objects to turn into function arguments
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
        expression: type === 'dimension' ? `dimension:${dimensionName}` : 'self',
        values: values || null,
        defaultValue
      };
    });
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
