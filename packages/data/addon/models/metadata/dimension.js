/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as array } from '@ember/array';
import { get } from '@ember/object';
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
    return this.sourceColumn.table.cardinalitySize;
  }

  /**
   * Fetches tags for a given field name
   *
   * @method getTagsForField
   * @param {String} fieldName - name of the field to query tags
   * @returns {Array} array of tags
   */
  getTagsForField(fieldName) {
    let fields = array(get(this, 'fields')),
      field = fields.findBy('name', fieldName) || {};

    return get(field, 'tags') || [];
  }

  /**
   * Fetches fields for a given tag
   *
   * @method getFieldsForTag
   * @param {String} tag - name of tag
   * @returns {Array} array of field objects
   */
  getFieldsForTag(tag) {
    let fields = array(get(this, 'fields'));

    return fields.filter(field => {
      let tags = array(get(field, 'tags'));
      return tags.includes(tag);
    });
  }

  /**
   * @property {String} primaryKeyFieldName
   */
  get primaryKeyFieldName() {
    let tag = get(this, 'primaryKeyTag'),
      field = this.getFieldsForTag(tag)[0] || {};
    return get(field, 'name') || 'id';
  }

  /**
   * @property {String} descriptionFieldName
   */
  get descriptionFieldName() {
    let tag = get(this, 'descriptionTag'),
      field = this.getFieldsForTag(tag)[0] || {};
    return get(field, 'name') || 'desc';
  }

  /**
   * @property {String} idFieldName
   */
  get idFieldName() {
    let tag = get(this, 'idTag'),
      field = this.getFieldsForTag(tag)[0] || {};
    return get(field, 'name') || get(this, 'primaryKeyFieldName');
  }

  /**
   * @property {Promise} extended - extended metadata for the dimension that isn't provided in initial table fullView metadata load
   */
  get extended() {
    const { metadata, name } = this;
    return metadata.findById('metric', name);
  }
}
