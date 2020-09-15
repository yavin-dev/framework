/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { assert } from '@ember/debug';
import ColumnMetadataModel, { ColumnMetadata, ColumnMetadataPayload, ColumnType } from './column';
import CARDINALITY_SIZES from '../../utils/enums/cardinality-sizes';

type Cardinality = typeof CARDINALITY_SIZES[number] | undefined;
type Field = TODO;

// Shape of public properties on model
export interface DimensionMetadata extends ColumnMetadata {
  cardinality: Cardinality;
  getTagsForField(fieldName: string): string[];
  getFieldsForTag(tag: string): Field[];
  primaryKeyFieldName: string;
  descriptionFieldName: string;
  idFieldName: string;
  extended: Promise<DimensionMetadataModel | undefined>;
}
// Shape passed to model constructor
export interface DimensionMetadataPayload extends ColumnMetadataPayload {
  fields?: Field[];
  cardinality?: Cardinality;
  storageStrategy?: TODO<'loaded' | 'none' | null>;
}

export default class DimensionMetadataModel extends ColumnMetadataModel
  implements DimensionMetadata, DimensionMetadataPayload {
  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

  metadataType: ColumnType = 'dimension';

  /**
   * @property {Object[]} fields - Array of field objects
   */
  fields?: Field[];

  /**
   * @property {string} primaryKeyTag - name of the primary key tag
   */
  private primaryKeyTag = 'primaryKey';

  /**
   * @property {string} descriptionTag - name of the description tag
   */
  private descriptionTag = 'description';

  /**
   * @property {string} idTag - name of the searchable id tag
   */
  private idTag = 'id';

  /**
   * @property {string} _cardinality - cardinality assigned directly to the dimension
   */
  private _cardinality: Cardinality;

  /**
   * @property {Cardinality|undefined} cardinality - the cardinality size of the table the dimension is sourced from
   */
  get cardinality(): Cardinality {
    const { type } = this;

    if (type === 'field') return this._cardinality;

    // TODO: get cardinality for ref and formula type dimensions
    return undefined;
  }
  set cardinality(cardinality: Cardinality) {
    assert(
      'Dimension cardinality should be set to a value included in CARDINALITY_SIZES',
      cardinality && CARDINALITY_SIZES.includes(cardinality)
    );
    this._cardinality = cardinality;
  }

  /**
   * Fetches tags for a given field name
   *
   * @method getTagsForField
   * @param {string} fieldName - name of the field to query tags
   * @returns {Array} array of tags
   */
  getTagsForField(fieldName: string): string[] {
    const field = this.fields?.find(f => f.name === fieldName);

    return field?.tags || [];
  }

  /**
   * Fetches fields for a given tag
   *
   * @method getFieldsForTag
   * @param {string} tag - name of tag
   * @returns {Array} array of field objects
   */
  getFieldsForTag(tag: string): Field[] {
    return (
      this.fields?.filter(field => {
        return field.tags?.includes(tag);
      }) || []
    );
  }

  /**
   * @property {string} primaryKeyFieldName
   */
  get primaryKeyFieldName(): string {
    const { primaryKeyTag: tag } = this;
    const field = this.getFieldsForTag(tag)?.[0];
    return field?.name || 'id';
  }

  /**
   * @property {string} descriptionFieldName
   */
  get descriptionFieldName(): string {
    const { descriptionTag: tag } = this;
    const field = this.getFieldsForTag(tag)?.[0];
    return field?.name || 'desc';
  }

  /**
   * @property {string} idFieldName
   */
  get idFieldName(): string {
    const { idTag: tag } = this;
    const field = this.getFieldsForTag(tag)?.[0];
    return field?.name || this.primaryKeyFieldName;
  }

  storageStrategy?: TODO<'loaded' | 'none' | null>;

  /**
   * @property {Promise} extended - extended metadata for the dimension that isn't provided in initial table fullView metadata load
   */
  get extended(): Promise<DimensionMetadataModel> {
    const { naviMetadata, id, source } = this;
    return naviMetadata.findById('dimension', id, source).then(d => d || this);
  }
}

declare module './registry' {
  export default interface MetadataModelRegistry {
    dimension: DimensionMetadataModel;
  }
}
