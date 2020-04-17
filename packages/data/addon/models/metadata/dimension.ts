/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import Column, { BaseExtendedAttributes } from './column';
import CARDINALITY_SIZES from '../../utils/enums/cardinality-sizes';

type Cardinality = typeof CARDINALITY_SIZES[number] | undefined;
type Field = TODO;
type ExtendedAttributes = BaseExtendedAttributes;

export default class Dimension extends Column {
  /**
   * @static
   * @property {string} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {Ember.Service} metadata
   */
  @service('bard-metadata')
  metadata!: TODO;

  /**
   * @property {Object[]} fields - Array of field objects
   */
  fields?: Field[];

  /**
   * @property {string} primaryKeyTag - name of the primary key tag
   */
  primaryKeyTag = 'primaryKey';

  /**
   * @property {string} descriptionTag - name of the description tag
   */
  descriptionTag = 'description';

  /**
   * @property {string} idTag - name of the searchable id tag
   */
  idTag = 'id';

  /**
   * @property {string} _cardinality - cardinality assigned directly to the dimension
   */
  _cardinality: Cardinality;

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

  /**
   * @property {Promise} extended - extended metadata for the dimension that isn't provided in initial table fullView metadata load
   */
  get extended(): Promise<Dimension & ExtendedAttributes> {
    const { metadata, id, source } = this;
    return metadata.findById('dimension', id, source);
  }
}
