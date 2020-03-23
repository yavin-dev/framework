/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the metric function endpoint
 */

import { INTRINSIC_VALUE_EXPRESSION } from 'navi-data/models/metadata/function-argument';
import EmberObject from '@ember/object';

/**
 * @method constructFunctionArguments
 * @param {Object} parameters - map of parameter objects to turn into function arguments
 * @returns {Object[]} array of function argument objects
 */
export function constructFunctionArguments(parameters) {
  return Object.keys(parameters).map(param => {
    const paramObj = parameters[param];
    const { type, defaultValue, values, dimensionName } = paramObj;

    return {
      id: param,
      name: param,
      valueType: 'TEXT',
      type: 'ref', // It will always be ref for our case because all our parameters have their valid values defined in a dimension or enum
      expression: type === 'dimension' ? `dimension:${dimensionName}` : INTRINSIC_VALUE_EXPRESSION,
      _localValues: values || null,
      defaultValue
    };
  });
}

export default class MetricFunctionSerializer extends EmberObject {
  /**
   * @private
   * @method _normalizeMetricFunctions - normalizes the JSON response
   * @param {Object[]} metricFunctions - JSON response objects
   * @param {String} source - datasource name
   * @returns {Object[]} - normalized metric function objects
   */
  _normalizeMetricFunctions(metricFunctions, source) {
    return metricFunctions.map(func => {
      const { id, name, description, arguments: args } = func;
      const normalizedFunc = {
        id,
        name,
        description,
        source
      };
      if (func.arguments) {
        normalizedFunc.arguments = constructFunctionArguments(args);
      }
      return normalizedFunc;
    });
  }

  /**
   * @method normalize - normalizes the JSON response
   * @param {Object[]} payload - JSON response object
   * @param {String} source - datasource name
   * @returns {Object} - normalized JSON object
   */
  normalize(payload, source) {
    if (payload && payload['metric-functions']?.rows) {
      return this._normalizeMetricFunctions(payload['metric-functions'].rows, source);
    }
  }
}
