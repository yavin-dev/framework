/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import KegService from '../../services/keg';
import Table from './table';

export type ColumnNode = {
  id: string;
  name: string;
  description: string;
  category: string;
  valueType: TODO<string>;
  columnTags: string[];
};

export type ColumnType = 'ref' | 'formula' | 'field';

export type BaseExtendedAttributes = {
  description?: string;
};

export default class Column extends EmberObject {
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
  tableId!: string;

  /**
   * @property {Table} table
   */
  get table(): Table {
    const { tableId, keg, source } = this;
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
  tags: string[] = [];
}
