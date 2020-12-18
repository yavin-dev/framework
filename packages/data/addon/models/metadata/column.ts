/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';
import TableMetadataModel from './table';
import ColumnFunction from './column-function';
import FunctionParameter from './function-parameter';
import NaviMetadataService, { MetadataModelTypes } from 'navi-data/services/navi-metadata';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { Parameters } from 'navi-data/adapters/facts/interface';

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
  valueType: TODO<string>;
  type: RawColumnType;
  expression?: string;
  columnFunctionId?: string;
  tags?: string[];
  partialData?: boolean; //TODO refactor me
}

export interface ColumnInstance<T extends ColumnMetadataModel> {
  columnMetadata: T;
  parameters?: Parameters;
}

// Shape of public properties on model
export interface ColumnMetadata {
  id: string;
  name: string;
  metadataType: ColumnType;
  category?: string;
  description?: string;
  table: TableMetadataModel | undefined;
  source: string;
  valueType: TODO<string>;
  type: RawColumnType;
  expression?: string;
  columnFunction: ColumnFunction | undefined;
  hasParameters: boolean;
  parameters: FunctionParameter[];
  getParameter(id: string): FunctionParameter | undefined;
  getDefaultParameters(): Dict<string> | undefined;
}

export default class ColumnMetadataModel extends EmberObject implements ColumnMetadata, ColumnMetadataPayload {
  @service
  protected naviMetadata!: NaviMetadataService;

  /**
   * @property id - unique column id
   */
  id!: string;

  /**
   * @property name - Display name of column
   */
  name!: string;

  /**
   * @property metadataType - metadata type
   */
  metadataType!: ColumnType;

  /**
   * @property description - an extended attribute that can be fetched
   */
  description?: string;

  /**
   * @property tableId
   */
  tableId?: string;

  /**
   * @property table - the table metadata for this column
   */
  get table(): TableMetadataModel | undefined {
    const { tableId, naviMetadata, source } = this;
    if (isNone(tableId)) return undefined;
    return naviMetadata.getById('table', tableId, source);
  }

  /**
   * @property source - name of the data source this column is from.
   */
  source!: string;

  /**
   * @property type - will be "ref", "formula", or "field" depending on where its values are sourced from
   */
  type!: RawColumnType;

  /**
   * @property expression - e.g. tableA.name if type is ref
   */
  expression?: string;

  /**
   * @property category
   */
  category?: string;

  /**
   * @property valueType - enum value describing what type the values of this column hold
   */
  valueType!: TODO<string>;

  /**
   * @property tags
   */
  tags?: string[];

  partialData?: boolean;

  /**
   * @property columnFunctionId
   */
  columnFunctionId!: string;

  /**
   * @property columnFunction - allows parameters to be applied to this column
   */
  get columnFunction(): ColumnFunction | undefined {
    const { columnFunctionId, source, naviMetadata } = this;

    if (columnFunctionId) {
      return naviMetadata.getById('columnFunction', columnFunctionId, source);
    }
    return undefined;
  }

  /**
   * @property hasParameters - can this column have parameters
   */
  get hasParameters(): boolean {
    return !!this.parameters?.length;
  }

  /**
   * @property parameters - parameters for the column
   */
  get parameters(): FunctionParameter[] {
    return this.columnFunction?.parameters || [];
  }

  /**
   * retrieves the queried parameter object from metadata
   * @param id
   */
  getParameter(id: string): FunctionParameter | undefined {
    return this.parameters.find(param => param.id === id);
  }

  /**
   * retrieves all the default values for all the parameters
   */
  getDefaultParameters(): Record<string, string> | undefined {
    if (!this.hasParameters) {
      return undefined;
    }

    return this.parameters.reduce((acc: Dict<string>, param) => {
      if (param.defaultValue) {
        acc[param.id] = param.defaultValue;
      }
      return acc;
    }, {});
  }

  getCanonicalName(parameters?: Parameters) {
    const { id: metric } = this;
    // TODO rename with generic canonicalizeColumn
    return canonicalizeMetric({ metric, parameters });
  }
}
