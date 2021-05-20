/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Column function parameters are named and have rules for what values are valid
 * The values control configuration for an parameters on a base metric
 */
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { taskFor } from 'ember-concurrency-ts';
import NativeWithCreate from 'navi-data/models/native-with-create';
import type NaviDimensionService from 'navi-data/services/navi-dimension';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { DimensionColumn } from './dimension';

export const INTRINSIC_VALUE_EXPRESSION = 'self';

type FunctionParameterType = 'ref' | 'primitive';
export type ColumnFunctionParametersValues = { id: string; name?: string; description?: string }[]; //TODO need to normalize

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
  type: FunctionParameterType;
  expression?: string;
  defaultValue?: string | null;
  _localValues?: ColumnFunctionParametersValues;
}

type Expresion = typeof INTRINSIC_VALUE_EXPRESSION | `dimension:${string}`;

export default class FunctionParameterMetadataModel extends NativeWithCreate {
  static identifierField = 'id';
  constructor(owner: unknown, args: FunctionParameterMetadataPayload) {
    super(owner, args);
  }

  @service('navi-dimension')
  declare dimensionService: NaviDimensionService;

  @service('navi-metadata')
  declare metadataService: NaviMetadataService;

  declare id: string;

  declare name: string;

  declare description?: string;

  /**
   * name of the data source this parameter is from.
   */
  declare source: string;

  declare type: FunctionParameterType;

  declare expression?: Expresion;

  declare defaultValue?: string | null;

  /**
   * enum values for the parameter
   */
  declare protected _localValues?: ColumnFunctionParametersValues;

  /**
   * promise that resolves to an array of values used for function parameters with an enum type
   */
  get values(): Promise<ColumnFunctionParametersValues> | undefined {
    if (isLocalFunction(this)) {
      return Promise.resolve(this._localValues);
    }

    const [lookup, dimensionId] = this.expression?.split(':') || [];
    if (this.type === 'ref' && lookup === 'dimension' && dimensionId) {
      return this.metadataService
        .findById('dimension', dimensionId, this.source)
        .then((columnMetadata) => {
          assert(`The dimension metadata for ${dimensionId} should exist`, columnMetadata);
          const dimension: DimensionColumn = { columnMetadata, parameters: {} };
          return taskFor(this.dimensionService.all).perform(dimension);
        })
        .then((v) => v.values.map((d) => ({ id: `${d.value}`, description: d.displayValue })));
    }
    return undefined;
  }
}
