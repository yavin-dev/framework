/**
 * Copyright 2021, Yahoo Holdings Inc.
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
import type { DimensionColumn, TableSource } from './dimension';
import type { ValueSourceType } from './elide/dimension';

export const INTRINSIC_VALUE_EXPRESSION = 'self';

//TODO we should use this in the column type definition
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

export enum CustomParamDataType {
  ENTITY = 'ENTITY',
}

export type ParameterDataType = DataType | CustomParamDataType;

export type BardParamEntity = { id: string; name?: string; description?: string };

export type ColumnFunctionParametersValue = BardParamEntity | string | number | boolean;

export type ColumnFunctionParametersValues = ColumnFunctionParametersValue[];

export interface FunctionParameterMetadataPayload {
  id: string;
  name: string;
  description?: string;
  source: string;
  valueSourceType: ValueSourceType;
  valueType: ParameterDataType;
  defaultValue?: string | null;
  tableSource?: TableSource;
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

  declare valueType: ParameterDataType;

  declare valueSourceType: ValueSourceType;

  declare tableSource?: TableSource;

  declare defaultValue?: string | null;

  /**
   * enum values for the parameter
   */
  protected declare _localValues: ColumnFunctionParametersValues;

  /**
   * promise that resolves to an array of values used for function parameters with an enum type
   */
  get values(): Promise<ColumnFunctionParametersValues | undefined> {
    if (this.valueSourceType === 'ENUM') {
      return Promise.resolve(this._localValues);
    }

    if (this.valueSourceType === 'TABLE') {
      return this.metadataService
        .findById('dimension', this.tableSource?.valueSource ?? '', this.source)
        .then((columnMetadata) => {
          assert(`The dimension metadata for '${this.tableSource?.valueSource}' should exist`, columnMetadata);
          const dimension: DimensionColumn = { columnMetadata, parameters: {} };
          return taskFor(this.dimensionService.all).perform(dimension);
        })
        .then((v) =>
          v.values.map((d) => {
            const context = d.suggestions ? ` (${Object.values(d.suggestions)})` : '';
            return {
              id: `${d.value}`,
              description: `${d.displayValue}${context}`,
            };
          })
        );
    }

    //else valueSourceType is NONE
    if (this.valueType === DataType.BOOLEAN) {
      return Promise.resolve([true, false]);
    }

    return Promise.resolve(undefined);
  }
}
