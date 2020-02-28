/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';

export default class FunctionArgument extends EmberObject {
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
   * @property {ValueType} valueType
   */
  valueType;

  /**
   * @property {String} type - either "ref" or "primitive"
   */
  type;

  /**
   * @property {String} expression - used if type is ref to get the valid values
   */
  expression;

  /**
   * @property {String[]} values - array of values used for function arguments with an enum type
   */
  values;

  /**
   * @property {String} defaultValue
   */
  defaultValue;
}
