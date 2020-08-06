/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A collection of function parameters that has a one to many relationship to columns
 */
import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import FunctionParameter, { FunctionParameterMetadataPayload } from './function-parameter';

export interface ColumnFunctionMetadataPayload {
  id: string;
  name: string;
  description?: string;
  source: string;
  _parametersPayload?: FunctionParameterMetadataPayload[];
}
export interface ColumnFunctionMetadata {
  id: string;
  name: string;
  description?: string;
  source: string;
  parameters: FunctionParameter[];
}

export default class ColumnFunctionMetadataModel extends EmberObject
  implements ColumnFunctionMetadataPayload, ColumnFunctionMetadata {
  init() {
    //@ts-ignore
    super.init(...arguments);
    const owner = getOwner(this);
    const parameters = (this._parametersPayload || []).map(param =>
      FunctionParameter.create(owner.ownerInjection(), param)
    );
    this.parameters = parameters;
  }

  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

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
   * @property {string} source
   */
  source!: string;

  /**
   * @property {FunctionParameterMetadataPayload[]} _parametersPayload - Initializer payload property for actual parameters
   */
  _parametersPayload?: FunctionParameterMetadataPayload[];

  /**
   * @property {FunctionParameter[]} - Function parameter instances related to this column function
   */
  parameters!: FunctionParameter[];
}
