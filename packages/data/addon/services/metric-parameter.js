/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that can fetch metric parameters
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { resolve, hash } from 'rsvp';

export default class MetricParameterService extends Service {
  constructor() {
    super(...arguments);
    /**
     * @property {Object} _supportedHandlers List of parameter types supported.
     */
    this._supportedHandlers = {
      dimension: this._dimension.bind(this),
      self: this._enum.bind(this)
    };
  }

  /**
   * @private
   * @property {Ember.Service} dimensionService
   */
  @service('bard-dimensions') _dimensionService;

  /**
   * @property {String[]} list of parameter types this service supports
   */
  get supportedTypes() {
    return Object.keys(this._supportedHandlers);
  }

  /**
   * @method fetchAllValues
   * fetches all values of type dimension for the metric parameter
   *
   * @param {Object} parameter - metric parameter objects
   * @returns {Promise} response with dimension values
   */
  fetchAllValues(meta) {
    const valueSourceType = meta.expression?.split(':')[0];
    assert(
      `Fetching values of type: '${valueSourceType}' is not supported`,
      this.supportedTypes.includes(valueSourceType)
    );

    return this._supportedHandlers[valueSourceType](meta);
  }

  /**
   * @method fetchAllParams
   * @param {Object} metricMeta - Metric metadata object
   * @returns {Promise} promise hash with all the kinds of params and their values
   */
  fetchAllParams(metricMeta) {
    const promises = {};
    const supportedTypes = this.supportedTypes;
    const parameters = (metricMeta.arguments || []).filter(
      param => param.type === 'ref' && supportedTypes.includes(param.expression.split(':')[0])
    );

    parameters.forEach(param => {
      promises[param.id] = this.fetchAllValues(param);
    });

    const promiseHash = hash(promises).then(res => {
      const allParametersMap = {};
      //add property param to every element in each array
      Object.entries(res).forEach(([key, values]) => {
        const valArray = Array.isArray(values) ? values : values.toArray();
        valArray.forEach(val => {
          // copy value and specify param
          const paramVal = Object.assign({}, val, { param: key });

          //add object to map
          allParametersMap[`${key}|${paramVal.id}`] = paramVal;
        });
      });

      return allParametersMap;
    });

    return promiseHash;
  }

  /**
   * @private
   * Fetches dimension values from service
   * @param {Object} meta - parameterized metric metadata
   * @returns {Promise} response with dimension values
   */
  _dimension({ expression }) {
    const dimensionName = expression.split(':')[1];
    return this._dimensionService.all(dimensionName);
  }

  /**
   * @private
   * Fetches dimension values from meta for enum type
   * @param {Object} meta - parameterized metric metadata
   * @returns {Promise} response with dimension values
   */
  _enum(meta) {
    return resolve(meta._localValues);
  }
}
