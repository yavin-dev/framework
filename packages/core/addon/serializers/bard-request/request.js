/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import { hasParameters, getAliasedMetrics, canonicalizeMetric } from 'navi-data/utils/metric';
import { get } from '@ember/object';

export default DS.JSONSerializer.extend({
  /**
   * @overide
   * @property {Object} attrs - model attribute config while serialization
   */
  attrs: {
    // Prevent sending below attributes in request payload
    responseFormat: { serialize: false }
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

    // Flip the alias map so it's an object of canonName -> aliases
    const canonToAlias = Object.entries(getAliasedMetrics(request.metrics)).reduce(
      (obj, [val, key]) => Object.assign({}, obj, { [key]: val }),
      {}
    ); // flip flip flipadelphia

    // transform sorts to have appropriate aliases, removes parameter map
    request.sort = this._removeParameters(this._toggleAlias(request.sort, canonToAlias));
    request.having = this._removeParameters(this._toggleAlias(request.having, canonToAlias));
    return request;
  },

  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type
   * @param request - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type, request) {
    // get alias -> canonName map
    const aliasToCanon = getAliasedMetrics(request.metrics);

    // build canonName -> metric map
    const canonToMetric = request.metrics.reduce(
      (obj, metric) =>
        Object.assign({}, obj, {
          [canonicalizeMetric(metric)]: metric
        }),
      {}
    );

    //add dateTime to cannonicalName -> metric map
    canonToMetric['dateTime'] = { metric: 'dateTime' };

    request.having = this._toggleAlias(request.having, aliasToCanon, canonToMetric);
    request.sort = this._toggleAlias(request.sort, aliasToCanon, canonToMetric);

    //remove AS from metric parameters
    request.metrics = request.metrics.map(metric => {
      if (hasParameters(metric)) {
        delete metric.parameters.as;
      }
      return metric;
    });

    return this._super(type, request);
  },

  /**
   * Used to remove parameters from having/sorts for serialization
   * @param {Array} arr - Array of objects
   * @return {Array} Array of objects without parameter
   * @private
   */
  _removeParameters(arr) {
    return arr.map(value => {
      delete value.parameters;
      return value;
    });
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
      if (hasParameters(metric)) {
        metric.parameters.as = 'm' + ++inc;
      }
      return metric;
    });
  },

  /**
   * Input a list of objects, replace with alias or canonicalized metric,
   * if provided will replace serialized metric.
   *
   * This works on both ends of serialization and deserialization
   *
   * @param {array} field - property off the request object to transform
   * @param aliasMap {object} - Either a map of of aliases to canon name (for deserialization) or canon name to alias (for serialization)
   * @param canonMap {object} - Map of canon name to metric object {metric, parameters}
   * @return {array} - copy of the field object transformed with aliases, or alias to metric object
   * @private
   */
  _toggleAlias(field, aliasMap, canonMap = {}) {
    if (!field) {
      return;
    }
    return field.map(obj => {
      let metricName =
        canonicalizeMetric(obj.metric) ||
        (typeof get(obj, 'metric') === 'string' && get(obj, 'metric')) ||
        get(obj, 'metric.metric');

      obj.metric = aliasMap[metricName] || metricName;
      obj.metric = canonMap[obj.metric] || obj.metric;
      return obj;
    });
  }
});
