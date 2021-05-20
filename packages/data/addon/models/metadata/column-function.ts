/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A collection of function parameters that has a one to many relationship to columns
 */
import NativeWithCreate, { Factory } from 'navi-data/models/native-with-create';
import type FunctionParameter from 'navi-data/models/metadata/function-parameter';
import type { FunctionParameterMetadataPayload } from 'navi-data/models/metadata/function-parameter';

export interface ColumnFunctionMetadataPayload {
  id: string;
  name: string;
  description?: string;
  source: string;
  _parametersPayload?: FunctionParameterMetadataPayload[];
}

export default class ColumnFunctionMetadataModel extends NativeWithCreate {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(owner: any, args: ColumnFunctionMetadataPayload) {
    super(owner, args);
    const parameterFactory = owner.factoryFor('model:metadata/function-parameter') as Factory<typeof FunctionParameter>;
    const parameters = (this._parametersPayload || []).map((param) => parameterFactory.create(param));
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
declare module 'navi-data/models/metadata/registry' {
  export default interface MetadataModelRegistry {
    columnFunction: ColumnFunctionMetadataModel;
  }
}
