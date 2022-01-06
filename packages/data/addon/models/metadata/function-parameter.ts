/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Column function parameters are named and have rules for what values are valid
 * The values control configuration for an parameters on a base metric
 */
import { inject as service } from '@ember/service';
import NativeWithCreate from 'navi-data/models/native-with-create';
import type NaviDimensionService from 'navi-data/services/navi-dimension';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import { ValueSourceType } from './elide/dimension';

export const INTRINSIC_VALUE_EXPRESSION = 'self';

//TODO is there a better place for this
export enum DataType {
  TIME = 'TIME',
  INTEGER = 'INTEGER',
  DECIMAL = 'DECIMAL',
  MONEY = 'MONEY',
  TEXT = 'TEXT',
  COORDINATE = 'COORDINATE',
  BOOLEAN = 'BOOLEAN',
  ID = 'ID',
  UNKNOWN = 'UNKNOWN',
}

export type ColumnFunctionParametersValue =
  | { id: string; name?: string; description?: string }
  | string
  | number
  | boolean;

export type ColumnFunctionParametersValues = ColumnFunctionParametersValue[];

export interface FunctionParameterMetadataPayload {
  id: string;
  name: string;
  description?: string;
  source: string;
  valueSourceType: ValueSourceType;
  type: DataType;
  defaultValue?: string | null;
  _localValues?: ColumnFunctionParametersValues;
}

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

  declare source: string;

  declare type: DataType;

  declare valueSourceType: ValueSourceType;

  declare defaultValue?: string | null;

  /**
   * enum values for the parameter
   */
  protected declare _localValues: ColumnFunctionParametersValues;

  /**
   * promise that resolves to an array of values used for function parameters with an enum type
   */
  get values(): Promise<ColumnFunctionParametersValues> | undefined {
    if (this.valueSourceType === 'ENUM') {
      return Promise.resolve(this._localValues);
    }

    if (this.valueSourceType === 'TABLE') {
      throw new Error('Table Back Argument Values Not Yet Supported');
    }

    //else valueSourceType is NONE

    if (this.type === DataType.BOOLEAN) {
      return Promise.resolve([true, false]);
    }

    return undefined;
  }
}
