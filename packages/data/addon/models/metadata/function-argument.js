/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Metric function arguments are named and have rules for what values are valid
 * The values control configuration for an argument on a base metric
 */
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';

export const INTRINSIC_VALUE_EXPRESSION = 'self';

export default class FunctionArgument extends EmberObject {
  /**
   * @static
   * @property {String} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {Service} dimensionService
   */
  @service('bard-dimensions')
  dimensionService;

  /**
   * @property {String} id
   */
  id;

  /**
   * @property {String} name
   */
  name;

  /**
   * @property {String} description
   */
  description;

  /**
   * @property {String} source - name of the data source this argument is from.
   */
  source;

  /**
   * @property {ValueType} valueType
   */
  valueType;

  /**
   * @property {String} type - either "ref" or "primitive"
   */
  type;

  /**
   * @property {String} expression - used if type is ref to get the valid values
   * Expected format is e.g. "dimension:dimensionOne" or "self" if the values come from an enum
   */
  expression;

  /**
   * @private
   * @property {String[]} _localValues
   * if metric function ids are not supplied by the metadata endpoint,
   * then enum values provided in the parameter will be placed here
   */
  _localValues;

  /**
   * @property {Promise} values - array of values used for function arguments with an enum type
   */
  get values() {
    if (this.expression === INTRINSIC_VALUE_EXPRESSION) {
      return Promise.resolve(this._localValues);
    }

    const [type, id] = this.expression?.split(':') || [];
    if (this.type === 'ref' && type === 'dimension' && id) {
      return this.dimensionService.all(id, this.source).then(results => results.content?.toArray?.());
    }
    return undefined;
  }

  /**
   * @property {String} defaultValue
   */
  defaultValue;
}
