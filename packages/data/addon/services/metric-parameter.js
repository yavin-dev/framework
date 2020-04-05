/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that can fetch metric parameters
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { assert } from '@ember/debug';
import { resolve, hash } from 'rsvp';

export default class MetricParameterService extends Service {
  constructor() {
    super(...arguments);
    /**
     * @property {Object} _supportedHandlers List of parametery types supported.
     */
    this._supportedHandlers = {
      dimension: this._dimension.bind(this),
      enum: this._enum.bind(this)
    };
  }

  /**
   * @private
   * @property {Ember.Service} dimensionService
   */
  @service('bard-dimensions') _dimensionService;

  /**
   * @returns {Array} list of parameter types this service supports
   */
  supportedTypes() {
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
    assert(`Fetching values of type: '${meta.type}' is not supported`, this.supportedTypes().includes(meta.type));

    return this._supportedHandlers[meta.type](meta);
  }

  /**
   * @method fetchAllParams
   * @param {Object} metricMeta - Metric metadata object
   * @returns {Promise} promise hash with all the kinds of params and their values
   */
  fetchAllParams(metricMeta) {
    const promises = {};
    const parameterObj = metricMeta.parameters || {};
    const supportedTypes = this.supportedTypes();
    const parameters = Object.entries(parameterObj).filter(([, paramMeta]) => supportedTypes.includes(paramMeta.type));

    parameters.forEach(([paramType, paramMeta]) => {
      promises[paramType] = this.fetchAllValues(paramMeta);
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
  _dimension({ dimensionName }) {
    return this._dimensionService.all(dimensionName);
  }

  /**
   * @private
   * Fetches dimension values from meta for enum type
   * @param {Object} meta - parameterized metric metadata
   * @returns {Promise} response with dimension values
   */
  _enum(meta) {
    return resolve(meta.values);
  }
}
