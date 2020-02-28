import { computed, get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import Column from './column';

export default class Metric extends Column {
  /**
   * @static
   * @property {String} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {Ember.Service} metadata
   */
  @service('bard-metadata')
  metadata;

  /**
   * @property {Format} defaultFormat
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
    return getOwner(this)
      .lookup('service:keg')
      .getById('metadata/metric/metric-function', this.metricFunctionId, this.source);
  }

  /**
   * @property {Boolean} hasParameters
   */
  @computed('metricFunction.arguments.[]')
  get hasParameters() {
    return (this.metricFunction || false) && !isEmpty(get(this, 'metricFunction.arguments'));
  }

  /**
   * @property {Array} paramNames - paramNames for the metric
   */
  @computed('metricFunction.arguments.[]')
  get paramNames() {
    return get(this, 'metricFunction.arguments') || [];
  }

  /**
   * @method {Object} getParameter
   * retrieves the queried parameter object from metadata
   *
   * @param {String} name
   * @returns {Object}
   */
  getParameter(name) {
    if (!get(this, 'hasParameters')) {
      return;
    }

    return get(this, `metricFunction.arguments`).findBy('name', name);
  }

  /**
   * @method {Object} getDefaultParameters
   * retrieves all the default values for all the parameters
   * @returns {Object|undefined}
   */
  getDefaultParameters() {
    if (!get(this, 'hasParameters')) {
      return;
    }

    const args = get(this, 'metricFunction.arguments') || [];

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
