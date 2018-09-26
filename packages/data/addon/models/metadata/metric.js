import ExtendedMetadataMixin from 'navi-data/mixins/extended-metadata';
import EmberObject, { computed, get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import forIn from 'lodash/forIn';

let Model = EmberObject.extend(ExtendedMetadataMixin, {
  /**
   * @property {String} type
   */
  type: 'metric',

  /**
   * @property {String} name
   */
  name: undefined,

  /**
   * @property {String} longName
   */
  longName: undefined,

  /**
   * @property {String} category
   */
  category: undefined,

  /**
   * @property {String} type of the value
   */
  valueType: undefined,

  /**
   * @property {Object} parameters - parameters for the metric
   */
  parameters: undefined,

  /**
   * @property {Boolean} hasParameters
   */
  hasParameters: computed('paramNames', function() {
    return !isEmpty(get(this, 'paramNames'));
  }),

  /**
   * @property {Array} paramNames - paramNames for the metric
   */
  paramNames: computed('parameters', function() {
    return Object.keys(get(this, 'parameters') || {});
  }),

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

    return get(this, `parameters.${name}`);
  },

  /**
   * @method {Object} getDefaultParameters
   * retrieves all the default values for all the parameters
   * @returns {Object|undefined}
   */
  getDefaultParameters() {
    if (!get(this, 'hasParameters')) {
      return;
    }

    let defaultParameters = {};
    forIn(get(this, 'parameters'), (value, key) => {
      defaultParameters[key] = get(value, 'defaultValue');
    });

    return defaultParameters;
  }
});

//factory level properties
export default Model.reopenClass({
  /**
   * @property {String} identifierField - used by the keg as identifierField
   */
  identifierField: 'name'
});
