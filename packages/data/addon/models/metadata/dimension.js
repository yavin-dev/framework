/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Column from './column';

export default class Dimension extends Column {
  /**
   * @static
   * @property {String} identifierField
   */
  static identifierField = 'id';

  /**
   * @property {Ember.Service} metadata
   */
  @service('bard-metadata')
  metadata;

  /**
   * @property {Object[]} fields - Array of field objects
   */

  fields;

  /**
   * @property {String} primaryKeyTag - name of the primary key tag
   */
  primaryKeyTag = 'primaryKey';

  /**
   * @property {String} description - name of the description tag
   */
  descriptionTag = 'description';

  /**
   * @property {String} idTag - name of the searchable id tag
   */
  idTag = 'id';

  /**
   * @property {CardinalitySize} cardinality - the cardinality size of the table the dimension is sourced from
   */
  get cardinality() {
    const { type, table } = this;

    if (type === 'field') {
      return Promise.resolve(table.cardinalitySize);
    }

    // TODO: get cardinality for ref and formula type dimensions
    return undefined;
  }

  /**
   * Fetches tags for a given field name
   *
   * @method getTagsForField
   * @param {String} fieldName - name of the field to query tags
   * @returns {Array} array of tags
   */
  getTagsForField(fieldName) {
    const field = this.fields.find(f => f.name === fieldName);

    return field?.tags || [];
  }

  /**
   * Fetches fields for a given tag
   *
   * @method getFieldsForTag
   * @param {String} tag - name of tag
   * @returns {Array} array of field objects
   */
  getFieldsForTag(tag) {
    return this.fields.filter(field => {
      return field.tags.includes(tag);
    });
  }

  /**
   * @property {String} primaryKeyFieldName
   */
  get primaryKeyFieldName() {
    const { primaryKeyTag: tag } = this;
    const field = this.getFieldsForTag(tag)[0];
    return field?.name || 'id';
  }

  /**
   * @property {String} descriptionFieldName
   */
  get descriptionFieldName() {
    const { descriptionTag: tag } = this;
    const field = this.getFieldsForTag(tag)[0];
    return field?.name || 'desc';
  }

  /**
   * @property {String} idFieldName
   */
  get idFieldName() {
    const { idTag: tag } = this;
    const field = this.getFieldsForTag(tag)[0];
    return field?.name || this.primaryKeyFieldName;
  }

  /**
   * @property {Promise} extended - extended metadata for the dimension that isn't provided in initial table fullView metadata load
   */
  get extended() {
    const { metadata, name, source } = this;
    return metadata.findById('dimension', name, source);
  }
}
