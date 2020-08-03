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

type FunctionArgumentType = 'ref' | 'primitive';
export type MetricFunctionArgumentsValues = TODO[]; //TODO need to normalize

type LocalFunctionArgument = FunctionArgumentMetadataModel & {
  type: 'ref';
  expression: 'self';
  _localValues: MetricFunctionArgumentsValues;
};

/**
 * Determines whether the values for this function are stored locally
 *
 * @function isLocalFunction
 * @returns {boolean} true if values are stored locally
 */
function isLocalFunction(functionArgument: FunctionArgumentMetadataModel): functionArgument is LocalFunctionArgument {
  return functionArgument.expression === INTRINSIC_VALUE_EXPRESSION;
}

export interface FunctionArgumentMetadataPayload {
  id: string;
  name: string;
  description?: string;
  source: string;
  valueType: TODO;
  type: FunctionArgumentType;
  expression?: string;
  defaultValue?: string;
  _localValues?: MetricFunctionArgumentsValues;
}

export default class FunctionArgumentMetadataModel extends EmberObject implements FunctionArgumentMetadataPayload {
  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {Service} dimensionService
   */
  @service('bard-dimensions')
  dimensionService!: TODO;

  /**
   * @property {string} id
   */
  id!: string;

  /**
   * @property {string} name
   */
  name!: string;

  /**
   * @property {string} description
   */
  description?: string;

  /**
   * @property {string} source - name of the data source this argument is from.
   */
  source!: string;

  /**
   * @property {ValueType} valueType
   */
  valueType!: TODO;

  /**
   * @property {string} type - either "ref" or "primitive"
   */
  type!: FunctionArgumentType;

  /**
   * @property {string|undefined} expression - used if type is ref to get the valid values
   * Expected format is e.g. "dimension:dimensionOne" or "self" if the values come from an enum
   */
  expression?: string;

  /**
   * @private
   * @property {string[]|undefined} _localValues
   * if metric function ids are not supplied by the metadata endpoint,
   * then enum values provided in the parameter will be placed here
   */
  _localValues?: string[];

  /**
   * @property {Promise} values - array of values used for function arguments with an enum type
   */
  get values(): Promise<MetricFunctionArgumentsValues> | undefined {
    if (isLocalFunction(this)) {
      return Promise.resolve(this._localValues);
    }

    const [type, id] = this.expression?.split(':') || [];
    if (this.type === 'ref' && type === 'dimension' && id) {
      return this.dimensionService.all(id, this.source).then((results: TODO) => results.content?.toArray?.());
    }
    return undefined;
  }

  /**
   * @property {string} defaultValue
   */
  defaultValue?: string;
}
