/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A collection of function parameters that has a one to many relationship to columns
 */
import NativeWithCreate, { Injector } from '../native-with-create.js';
import FunctionParameter from './function-parameter.js';
import type { FunctionParameterMetadataPayload } from './function-parameter.js';

export interface ColumnFunctionMetadataPayload {
  id: string;
  name: string;
  description?: string;
  source: string;
  _parametersPayload?: FunctionParameterMetadataPayload[];
}

export default class ColumnFunctionMetadataModel extends NativeWithCreate {
  constructor(injector: Injector, args: ColumnFunctionMetadataPayload) {
    super(injector, args);
    const parameters = (this._parametersPayload || []).map((param) => new FunctionParameter(injector, param));
    this.parameters = parameters;
  }

  static identifierField = 'id';

  declare id: string;

  declare name: string;

  declare description: string;

  declare source: string;

  /**
   * Initializer payload property for actual parameters
   */
  protected declare _parametersPayload: FunctionParameterMetadataPayload[];

  /**
   * Function parameter instances related to this column function
   */
  declare parameters: FunctionParameter[];
}
declare module './registry' {
  export default interface MetadataModelRegistry {
    columnFunction: ColumnFunctionMetadataModel;
  }
}
