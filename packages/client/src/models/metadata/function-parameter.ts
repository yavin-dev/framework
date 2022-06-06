/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Column function parameters are named and have rules for what values are valid
 * The values control configuration for an parameters on a base metric
 */
import NativeWithCreate, { ClientService, Injector } from '../native-with-create.js';
import invariant from 'tiny-invariant';
import type { DimensionColumn, TableSource } from './dimension.js';
import type { ValueSourceType } from './elide/dimension.js';
import type { ParameterValue } from '../../request.js';
import type NaviDimensionResponse from '../navi-dimension-response.js';
import type MetadataService from '../../services/interfaces/metadata.js';
import type DimensionService from '../../services/interfaces/dimension.js';

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

export type PotentialParameterValue = {
  id: ParameterValue; // actual param value provided in the request
  name: string; // nice name of param value
  description?: string; // descriptive label for param value (potentially with context)
};
export interface FunctionParameterMetadataPayload {
  id: string;
  name: string;
  description?: string;
  source: string;
  valueSourceType: ValueSourceType;
  valueType: DataType;
  defaultValue?: string | null;
  tableSource?: TableSource;
  _localValues?: PotentialParameterValue[];
}

export default class FunctionParameterMetadataModel extends NativeWithCreate {
  constructor(injector: Injector, args: FunctionParameterMetadataPayload) {
    super(injector, args);
  }

  @ClientService('navi-dimension')
  declare dimensionService: DimensionService;

  @ClientService('navi-metadata')
  declare metadataService: MetadataService;

  declare id: string;

  declare name: string;

  declare description?: string;

  declare source: string;

  declare valueType: DataType;

  declare valueSourceType: ValueSourceType;

  declare tableSource?: TableSource;

  declare defaultValue?: string | null;

  /**
   * enum values for the parameter
   */
  protected declare _localValues?: PotentialParameterValue[];

  /**
   * promise that resolves to an array of values used for function parameters with an enum type
   */
  get values(): PromiseLike<PotentialParameterValue[]> {
    if (this.valueSourceType === 'ENUM') {
      const { _localValues: values } = this;
      invariant(
        values?.length,
        `The function-parameter '${this.id}':'(${this.name})' is of type 'ENUM' but has no values`
      );
      return Promise.resolve(values);
    }

    if (this.valueSourceType === 'TABLE') {
      return this.metadataService
        .findById('dimension', this.tableSource?.valueSource ?? '', this.source)
        .then((columnMetadata) => {
          invariant(columnMetadata, `The dimension metadata for '${this.tableSource?.valueSource}' should exist`);
          const dimension: DimensionColumn = { columnMetadata, parameters: {} };
          return this.dimensionService.all.perform(dimension);
        })
        .then((v: NaviDimensionResponse) =>
          v.values.map((d) => {
            const context = d.suggestions ? `${Object.values(d.suggestions)}` : '';
            return {
              id: `${d.value}`,
              name: d.displayValue,
              description: `${d.displayValue} (${context})`,
            };
          })
        );
    }

    //else valueSourceType is NONE
    if (this.valueType === DataType.BOOLEAN) {
      return Promise.resolve([
        { id: true, name: 'True' },
        { id: false, name: 'False' },
      ]);
    }

    return Promise.resolve([]);
  }
}
