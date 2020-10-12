/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';
import Table from './table';
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
  table: Table | undefined;
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
   * @property {string} id
   */
  id!: string;

  /**
   * @property {string} name - Display name
   */
  name!: string;

  /**
   * @property {string} metadataType - metadata type
   */
  metadataType!: ColumnType;

  /**
   * @property {string|undefined} description - an extended attribute that can be fetched
   */
  description?: string;

  /**
   * @property {string} tableId
   */
  tableId?: string;

  /**
   * @property {Table} table
   */
  get table(): Table | undefined {
    const { tableId, naviMetadata, source } = this;
    if (isNone(tableId)) return undefined;
    return naviMetadata.getById('table', tableId, source);
  }

  /**
   * @property {string} source - name of the data source this column is from.
   */
  source!: string;

  /**
   * @property {ColumnType} type - will be "ref", "formula", or "field" depending on where its values are sourced from
   */
  type!: RawColumnType;

  /**
   * @property {string|undefined} expression - e.g. tableA.name if type is ref
   */
  expression?: string;

  /**
   * @property {string} category
   */
  category?: string;

  /**
   * @property {ValueType} valueType - enum value describing what type the values of this column hold
   */
  valueType!: TODO<string>;

  /**
   * @property {string[]} tags
   */
  tags?: string[];

  partialData?: boolean;

  /**
   * @property {string} columnFunctionId
   */
  columnFunctionId!: string;

  /**
   * Many to One relationship
   * @property {ColumnFunction} columnFunction
   */
  get columnFunction(): ColumnFunction | undefined {
    const { columnFunctionId, source, naviMetadata } = this;

    if (columnFunctionId) {
      return naviMetadata.getById('columnFunction', columnFunctionId, source);
    }
    return undefined;
  }

  /**
   * @property {boolean} hasParameters
   */
  get hasParameters(): boolean {
    return !!this.parameters?.length;
  }

  /**
   * @property {object[]} parameters - parameters for the column
   */
  get parameters(): FunctionParameter[] {
    return this.columnFunction?.parameters || [];
  }

  /**
   * @method getParameter - retrieves the queried parameter object from metadata
   * @param {string} id
   * @returns {object|undefined}
   */
  getParameter(id: string): FunctionParameter | undefined {
    return this.parameters.find(param => param.id === id);
  }

  /**
   * @method getDefaultParameters - retrieves all the default values for all the parameters
   * @returns {Dict<string>|undefined}
   */
  getDefaultParameters(): Dict<string> | undefined {
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
