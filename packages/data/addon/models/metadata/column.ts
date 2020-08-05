/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';
import KegService from '../../services/keg';
import Table from './table';
import ColumnFunction from './column-function';

export type ColumnType = 'ref' | 'formula' | 'field';

// Shape passed to model constructor
export interface ColumnMetadataPayload {
  id: string;
  name: string;
  category?: string;
  description?: string;
  tableId?: string; // Some columns do not have unique IDs
  source: string;
  valueType: TODO<string>;
  type: ColumnType;
  expression?: string;
  columnFunctionId?: string;
  tags?: string[];
  partialData?: boolean; //TODO refactor me
}

// Shape of public properties on model
export interface ColumnMetadata {
  id: string;
  name: string;
  category?: string;
  description?: string;
  table: Table | null;
  source: string;
  valueType: TODO<string>;
  type: ColumnType;
  expression?: string;
  columnFunction: ColumnFunction | undefined;
  hasParameters: boolean;
  arguments: TODO[];
  getParameter(id: string): TODO | undefined;
  getDefaultParameters(): Dict<string> | undefined;
}

export type BaseExtendedAttributes = {
  description?: string;
};

export default class ColumnMetadataModel extends EmberObject implements ColumnMetadata, ColumnMetadataPayload {
  /**
   * @property {KegService} keg
   */
  @service keg!: KegService;

  /**
   * @property {string} id
   */
  id!: string;

  /**
   * @property {string} name - Display name
   */
  name!: string;

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
  get table(): Table | null {
    const { tableId, keg, source } = this;
    if (isNone(tableId)) return null;
    const table = keg.getById('metadata/table', tableId, source);
    return (table as unknown) as Table;
  }

  /**
   * @property {string} source - name of the data source this column is from.
   */
  source!: string;

  /**
   * @property {ColumnType} type - will be "ref", "formula", or "field" depending on where its values are sourced from
   */
  type!: ColumnType;

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
    const { columnFunctionId, source, keg } = this;

    if (columnFunctionId) {
      return keg.getById('metadata/column-function', columnFunctionId, source);
    }
    return undefined;
  }

  /**
   * @property {boolean} hasParameters
   */
  get hasParameters(): boolean {
    return !!this.arguments?.length;
  }

  /**
   * @property {object[]} arguments - arguments for the metric
   */
  get arguments(): TODO[] {
    return this.columnFunction?.arguments || [];
  }

  /**
   * @method getParameter - retrieves the queried parameter object from metadata
   * @param {string} id
   * @returns {object|undefined}
   */
  getParameter(id: string): TODO | undefined {
    if (!this.hasParameters) {
      return;
    }

    return this.arguments.find(arg => arg.id === id);
  }

  /**
   * @method getDefaultParameters - retrieves all the default values for all the parameters
   * @returns {Dict<string>|undefined}
   */
  getDefaultParameters(): Dict<string> | undefined {
    if (!this.hasParameters) {
      return;
    }

    return this.arguments.reduce((acc: Dict<string>, curr) => {
      acc[curr.id] = curr.defaultValue;
      return acc;
    }, {});
  }
}
