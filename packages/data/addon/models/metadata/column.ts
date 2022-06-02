/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { isNone } from '@ember/utils';
import TableMetadataModel from './table';
import NativeWithCreate, { ClientService, Injector } from 'navi-data/models/native-with-create';
import { canonicalizeColumn } from '@yavin/client/utils/column';
import type ColumnFunction from './column-function';
import type FunctionParameter from './function-parameter';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { MetadataModelTypes } from 'navi-data/services/navi-metadata';
import type { Parameters } from '@yavin/client/request';

export type RawColumnType = 'ref' | 'formula' | 'field';
export type ColumnType = Extract<MetadataModelTypes, 'metric' | 'dimension' | 'timeDimension'>;

// Shape passed to model constructor
export interface ColumnMetadataPayload {
  id: string;
  name: string;
  category?: string;
  description?: string;
  tableId?: string; // Some columns do not have unique IDs
  source: string;
  valueType?: string;
  type: RawColumnType;
  isSortable: boolean;
  expression?: string;
  columnFunctionId?: string;
  tags?: string[];
  partialData?: boolean; //TODO refactor me
}

export interface ColumnInstance<T extends ColumnMetadataModel> {
  columnMetadata: T;
  parameters?: Parameters;
}

export default class ColumnMetadataModel extends NativeWithCreate {
  constructor(injector: Injector, args: ColumnMetadataPayload) {
    super(injector, args);
  }

  @ClientService('navi-metadata')
  protected declare naviMetadata: NaviMetadataService;

  /**
   * unique column id
   */
  declare id: string;

  /**
   * Display name of column
   */
  declare name: string;

  declare metadataType: ColumnType;

  /**
   * an extended attribute that can be fetched
   */
  declare description: string;

  declare tableId: string;

  /**
   * the table metadata for this column
   */
  get table(): TableMetadataModel | undefined {
    const { tableId, naviMetadata, source } = this;
    if (isNone(tableId)) return undefined;
    return naviMetadata.getById('table', tableId, source);
  }

  /**
   * name of the data source this column is from.
   */
  declare source: string;

  /**
   * will be "ref", "formula", or "field" depending on where its values are sourced from
   */
  declare type: RawColumnType;

  /**
   * whether or not this column can be sorted
   */
  declare isSortable: boolean;

  /**
   * e.g. tableA.name if type is ref
   */
  declare expression: string;

  declare category: string;

  /**
   * enum value describing what type the values of this column hold
   */
  declare valueType: string;

  declare tags: string[];

  declare partialData: boolean;

  declare columnFunctionId?: string;

  /**
   * allows parameters to be applied to this column
   */
  get columnFunction(): ColumnFunction | undefined {
    const { columnFunctionId, source, naviMetadata } = this;

    if (columnFunctionId) {
      return naviMetadata.getById('columnFunction', columnFunctionId, source);
    }
    return undefined;
  }

  /**
   * can this column have parameters
   */
  get hasParameters(): boolean {
    return !!this.parameters?.length;
  }

  /**
   * parameters for the column
   */
  get parameters(): FunctionParameter[] {
    return this.columnFunction?.parameters || [];
  }

  /**
   * retrieves the queried parameter object from metadata
   * @param id
   */
  getParameter(id: string): FunctionParameter | undefined {
    return this.parameters.find((param) => param.id === id);
  }

  /**
   * retrieves all the default values for all the parameters
   */
  getDefaultParameters(): Record<string, string> | undefined {
    if (!this.hasParameters) {
      return undefined;
    }

    return this.parameters.reduce((acc: Record<string, string>, param) => {
      if (param.defaultValue) {
        acc[param.id] = param.defaultValue;
      }
      return acc;
    }, {});
  }

  getCanonicalName(parameters?: Parameters) {
    const { id: field } = this;
    return canonicalizeColumn({ field, parameters });
  }
}
