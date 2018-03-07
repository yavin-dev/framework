/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import { hasParameters } from 'navi-data/utils/metric';

export default DS.JSONSerializer.extend({
  /**
   * @overide
   * @property {Object} attrs - model attribute config while serialization
   */
  attrs: {
    // Prevent sending below attributes in request payload
    responseFormat: {serialize: false}
  },

  /**
   * Serializes report to proper json api structure
   * @param {DS.Snapshot} snapshot
   * @param {Object} options
   * @return {Object} report as a json api structure
   */
  serialize(/*snapshot, options*/) {
    let request = this._super(...arguments);
    request.metrics = this._addAliases(request.metrics);
    return request;
  },

  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type
   * @param request - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type, request) {
    //remove AS from metric parameters
    request.metrics = request.metrics.map((metric) => {
      if(hasParameters(metric)) {
        delete metric.parameters.as;
      }
      return metric;
    });
    return this._super(type, request);
  },

  /**
   * Adds aliases to each parameterized metric
   * @param {Array} metrics - an array of metrics
   * @return {Array} array of metric objects with as parameter added to parameterized metrics
   * @private
   */
  _addAliases(metrics) {
    let inc = 0;
    return metrics.map(metric => {
      if(hasParameters(metric)) {
        metric.parameters.as = 'm' + (++inc);
      }
      return metric;
    })
  }
});
