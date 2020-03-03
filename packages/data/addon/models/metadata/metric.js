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
   * @property {Ember.Service} metadata
   */
  @service('bard-metadata')
  metadata;

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
    return this.metadataService.findById('metadata/metric/metric-function', this.metricFunctionId, this.source);
  }

  /**
   * @property {Boolean} hasParameters
   */
  get hasParameters() {
    return !!(this.metricFunction && this.metricFunction?.arguments.length);
  }

  /**
   * @property {Array} arguments - arguments for the metric
   */
  get arguments() {
    return this.metricFunction?.arguments || [];
  }

  /**
   * @method {Object} getParameter
   * retrieves the queried parameter object from metadata
   *
   * @param {String} name
   * @returns {Object}
   */
  getParameter(name) {
    if (!this.hasParameters) {
      return;
    }

    return this.metricFunction.arguments.find(arg => arg.name === name);
  }

  /**
   * @method {Object} getDefaultParameters
   * retrieves all the default values for all the parameters
   * @returns {Object|undefined}
   */
  getDefaultParameters() {
    if (!this.hasParameters) {
      return;
    }

    const { arguments: args } = this;

    return args.reduce((acc, curr) => {
      acc[curr.name] = curr.defaultValue;
    }, {});
  }

  /**
   * @property {Promise} extended - extended metadata for the metric that isn't provided in initial table fullView metadata load
   */
  get extended() {
    const { metadata, name } = this;
    return metadata.findById('metric', name);
  }
}
