/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import JSONSerializer from '@ember-data/serializer/json';
import { hasParameters, getAliasedMetrics } from 'navi-data/utils/metric';
import { inject as service } from '@ember/service';
import { normalizeV1, toggleAlias } from 'navi-core/utils/request';

export default class RequestSerializer extends JSONSerializer {
  /**
   * @property {Service}
   */
  @service bardMetadata;

  /**
   * @override
   * @property {Object} attrs - model attribute config while serialization
   */
  attrs = {
    // Prevent sending below attributes in request payload
    responseFormat: { serialize: false }
  };

  /**
   * Serializes report to proper json api structure
   * @param {DS.Snapshot} snapshot
   * @param {Object} options
   * @return {Object} report as a json api structure
   */
  serialize(/*snapshot, options*/) {
    const request = super.serialize(...arguments);
    request.metrics = this._addAliases(request.metrics);

    // Flip the alias map so it's an object of canonName -> aliases
    const canonToAlias = Object.entries(getAliasedMetrics(request.metrics)).reduce(
      (obj, [val, key]) => Object.assign({}, obj, { [key]: val }),
      {}
    ); // flip flip flipadelphia

    // transform sorts to have appropriate aliases, removes parameter map
    request.sort = this._removeParameters(toggleAlias(request.sort, canonToAlias));
    request.having = this._removeParameters(toggleAlias(request.having, canonToAlias));
    return request;
  }

  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type
   * @param request - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type, request) {
    //if datasource is undefined, try to infer from metadata
    const namespace = request.dataSource || this.bardMetadata.getTableNamespace(request.logicalTable.table);

    const normalized = normalizeV1(request, namespace);

    return super.normalize(type, normalized);
  }

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
  }

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
  }
}
