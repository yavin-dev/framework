/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard metadata
 */

import { A as arr } from '@ember/array';
import { v1 } from 'ember-uuid';
import EmberObject from '@ember/object';
import { groupBy } from 'lodash-es';

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
      metricFunctions = [],
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
            const currentMetrics = acc.metrics;
            const currentDimensions = acc.dimensions;
            const currentTimeDimensions = acc.timeDimensions;

            const timegrainDimensionObjects = timegrain.dimensions.map(dimension => {
              const { name, longName, category, datatype: valueType, storageStrategy } = dimension;
              return {
                id: name,
                name: longName,
                category,
                valueType,
                storageStrategy: storageStrategy || null,
                source,
                tableId: table.name
              };
            });

            // Separate the time dimensions from the normal dimensions
            const groupedDimensions = groupBy(timegrainDimensionObjects, dim =>
              dim.valueType === 'date' ? 'date' : 'text'
            );
            const timegrainDimensions = groupedDimensions.text || [];
            const timegrainTimeDimensions = groupedDimensions.date || [];

            const timegrainMetrics = timegrain.metrics.map(metric => {
              const { type, longName, name, category, parameters, metricFunctionId } = metric;
              const newMetric = {
                id: name,
                name: longName,
                valueType: type,
                source,
                category,
                tableId: table.name
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
                const metricFunction = this._getMetricFunctionId(metricFunctions, functionArguments);
                newMetric.metricFunctionId = metricFunction.id;
              }
              return newMetric;
            });

            acc.metrics = [...currentMetrics, ...timegrainMetrics];
            acc.dimensions = [...currentDimensions, ...timegrainDimensions];
            acc.timeDimensions = [...currentTimeDimensions, ...timegrainTimeDimensions];

            return acc;
          },
          { metrics: [], dimensions: [], timeDimensions: [] }
        );

        // Remove duplicates of columns that are present across multiple time grains
        allTableColumns.metrics = arr(allTableColumns.metrics).uniqBy('id');
        allTableColumns.dimensions = arr(allTableColumns.dimensions).uniqBy('id');
        allTableColumns.timeDimensions = arr(allTableColumns.timeDimensions).uniqBy('id');

        // Add the ids of each metrics and dimension to the table
        newTable.metricIds = allTableColumns.metrics.mapBy('id');
        newTable.dimensionIds = allTableColumns.dimensions.mapBy('id');
        newTable.timeDimensionIds = allTableColumns.timeDimensions.mapBy('id');

        // Add metrics and dimensions for the table to the overall metrics and dimensions arrays
        metrics = metrics.concat(allTableColumns.metrics);
        dimensions = dimensions.concat(allTableColumns.dimensions);
        timeDimensions = timeDimensions.concat(allTableColumns.timeDimensions);

        return newTable;
      });

    return {
      tables,
      dimensions,
      metrics,
      timeDimensions,
      metricFunctions
    };
  },

  /**
   * @private
   * @method _getMetricFunctionId
   * @param {Object[]} metricFunctions - the current dictionary of metric functions
   * @param {Object[]} functionArgs - the set of function argument objects to find or create a metric function for
   * @returns {Object} the existing metric function with the same arguments or a new metric function with passed in arguments
   */
  _getMetricFunctionId(metricFunctions, functionArgs) {
    const existingMetricFunction = metricFunctions.find(func => {
      const metricFunctionArgumentIds = func.arguments.map(metricFunctionArg => metricFunctionArg.id);
      return functionArgs.every(arg => metricFunctionArgumentIds.includes(arg.id));
    });

    if (existingMetricFunction) {
      return existingMetricFunction;
    }

    const newMetricFunction = {
      id: v1(), // Since we're deriving our own metric functions, we just assign each one a uuid as the id
      name: '',
      description: '',
      arguments: functionArgs
    };

    metricFunctions.push(newMetricFunction);
    return newMetricFunction;
  },

  /**
   * @private
   * @method _getFunctionArgumentIdentifier
   * @param {Object} parameter - old metric parameter shape to get a function argument identifier for
   * @returns {String} identifier based on the contents of an old metric parameter that will map to a function argument model
   */
  _getFunctionArgumentIdentifier(parameter) {
    const { name, type, defaultValue, dimensionName } = parameter;
    const typeQualifier = dimensionName ? `${type}:${dimensionName}` : type;

    return `${name}|${typeQualifier}|${defaultValue}`;
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
        type: 'ref', // It will always be ref for our case because all our parameters have its valid values defined in a dimension or enum
        expression: type === 'dimension' ? dimensionName : 'self',
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
