/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Column from './column';

export default class Metric extends Column {
  /**
   * @static
   * @property {String} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {Ember.Service} keg
   */
  @service('bard-metadata')
  metadataService;

  /**
   * @property {String} defaultFormat - e.g. decimal for numbers
   */
  defaultFormat;

  /**
   * @property {String} metricFunctionId
   */
  metricFunctionId;

  /**
   * Many to One relationship
   * @property {MetricFunction} metricFunction
   */
  get metricFunction() {
    const { metricFunctionId, source, metadataService } = this;

    if (metricFunctionId) {
      return metadataService.getById('metric-function', metricFunctionId, source);
    }
    return undefined;
  }

  /**
   * @property {Boolean} hasParameters
   */
  get hasParameters() {
    return !!this.arguments?.length;
  }

  /**
   * @property {Object[]} arguments - arguments for the metric
   */
  get arguments() {
    return this.metricFunction?.arguments || [];
  }

  /**
   * @method getParameter - retrieves the queried parameter object from metadata
   * @param {String} id
   * @returns {Object}
   */
  getParameter(id) {
    if (!this.hasParameters) {
      return;
    }

    return this.arguments.find(arg => arg.id === id);
  }

  /**
   * @method getDefaultParameters - retrieves all the default values for all the parameters
   * @returns {Object|undefined}
   */
  getDefaultParameters() {
    if (!this.hasParameters) {
      return;
    }

    return this.arguments.reduce((acc, curr) => {
      acc[curr.id] = curr.defaultValue;
      return acc;
    }, {});
  }

  /**
   * @property {Promise} extended - extended metadata for the metric that isn't provided in initial table fullView metadata load
   */
  get extended() {
    const { metadataService, id, source } = this;
    return metadataService.findById('metric', id, source);
  }
}
