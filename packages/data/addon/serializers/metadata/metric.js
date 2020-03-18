/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the metric endpoint
 */

import EmberObject from '@ember/object';

export default class MetricSerializer extends EmberObject {
  /**
   * @private
   * @method _normalizeMetrics - normalizes the JSON response
   * @param {Object[]} metrics - JSON response objects
   * @param {String} source - datasource name
   * @returns {Object[]} - normalized metric objects
   */
  _normalizeMetrics(metrics, source) {
    return metrics.map(metric => {
      const { type: valueType, longName: name, name: id, description, category, metricFunctionId } = metric;
      const normalizedMetric = {
        id,
        name,
        description,
        category,
        valueType,
        source
      };
      // const metricId = `${tableName}.${name}`;
      if (metricFunctionId) {
        normalizedMetric.metricFunctionId = metricFunctionId;
      }

      return normalizedMetric;
    });
  }

  /**
   * @method normalize - normalizes the JSON response
   * @param {Object[]} payload - JSON response object
   * @param {String} source - datasource name
   * @returns {Object} - normalized JSON object
   */
  normalize(payload, source) {
    if (payload && payload.metrics) {
      return this._normalizeMetrics(payload.metrics, source);
    }
  }
}
