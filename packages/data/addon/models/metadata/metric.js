/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Column from './column';

export default class Metric extends Column {
  /**
   * @override
   * @method init
   */
  init() {
    super.init(...arguments);

    const { metricFunctionId, source, metadataService } = this;

    if (metricFunctionId) {
      this.metricFunctionPromise = metadataService
        .findById('metric-function', metricFunctionId, source)
        .then(result => {
          this.metricFunction = result;
        });
    }
  }

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
  metricFunction;

  /**
   * @property {Promise} metricFunctionPromise - resolves when metricFunction is fetched from the id
   */
  metricFunctionPromise;

  /**
   * @property {Boolean} hasParameters
   */
  get hasParameters() {
    return !!this.metricFunction?.arguments?.length;
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

    return this.metricFunction.arguments.find(arg => arg.id === id);
  }

  /**
   * @method getDefaultParameters - retrieves all the default values for all the parameters
   * @returns {Object|undefined}
   */
  getDefaultParameters() {
    if (!this.hasParameters) {
      return;
    }

    const { arguments: args } = this;

    return args.reduce((acc, curr) => {
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
