/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Column function parameters are named and have rules for what values are valid
 * The values control configuration for an parameters on a base metric
 */
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import BardDimensionService from 'navi-data/services/bard-dimensions';

export const INTRINSIC_VALUE_EXPRESSION = 'self';

type FunctionParameterType = 'ref' | 'primitive';
export type ColumnFunctionParametersValues = TODO[]; //TODO need to normalize

type LocalFunctionParameter = FunctionParameterMetadataModel & {
  type: 'ref';
  expression: 'self';
  _localValues: ColumnFunctionParametersValues;
};

/**
 * Determines whether the values for this function are stored locally
 *
 * @function isLocalFunction
 * @returns {boolean} true if values are stored locally
 */
function isLocalFunction(
  functionParameter: FunctionParameterMetadataModel
): functionParameter is LocalFunctionParameter {
  return functionParameter.expression === INTRINSIC_VALUE_EXPRESSION;
}

export interface FunctionParameterMetadataPayload {
  id: string;
  name: string;
  description?: string;
  source: string;
  valueType: TODO;
  type: FunctionParameterType;
  expression?: string;
  defaultValue?: string;
  _localValues?: ColumnFunctionParametersValues;
}

export default class FunctionParameterMetadataModel extends EmberObject implements FunctionParameterMetadataPayload {
  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {Service} dimensionService
   */
  @service('bard-dimensions')
  dimensionService!: BardDimensionService;

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
   * @property {string} source - name of the data source this parameter is from.
   */
  source!: string;

  /**
   * @property {ValueType} valueType
   */
  valueType!: TODO;

  /**
   * @property {string} type - either "ref" or "primitive"
   */
  type!: FunctionParameterType;

  /**
   * @property {string|undefined} expression - used if type is ref to get the valid values
   * Expected format is e.g. "dimension:dimensionOne" or "self" if the values come from an enum
   */
  expression?: string;

  /**
   * @private
   * @property {string[]|undefined} _localValues
   * if column function ids are not supplied by the metadata endpoint,
   * then enum values provided in the parameter will be placed here
   */
  _localValues?: string[];

  /**
   * @property {Promise} values - array of values used for function parameters with an enum type
   */
  get values(): Promise<ColumnFunctionParametersValues> | undefined {
    if (isLocalFunction(this)) {
      return Promise.resolve(this._localValues);
    }

    const [lookup, dimensionId] = this.expression?.split(':') || [];
    if (this.type === 'ref' && lookup === 'dimension' && dimensionId) {
      return this.dimensionService.all(dimensionId, this.source).then((results: TODO) => results.toArray?.());
    }
    return undefined;
  }

  /**
   * @property {string} defaultValue
   */
  defaultValue?: string;
}
