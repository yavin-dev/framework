/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as array } from '@ember/array';
import EmberObject, { computed, get } from '@ember/object';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import ObjectProxy from '@ember/object/proxy';
import { inject as service } from '@ember/service';

let Model = EmberObject.extend({
  /**
   * @property {Ember.Service} metadata
   */
  metadata: service('bard-metadata'),

  /**
   * @property {String} type
   */
  type: 'dimension',

  /**
   * @property {String} name
   */
  name: undefined,

  /**
   * @property {String} longName
   */
  longName: undefined,

  /**
   * @property {String} category
   */
  category: undefined,

  /**
   * @property {String} cardinality
   */
  cardinality: undefined,

  /**
   * @property {String} datatype
   */
  datatype: undefined,

  /**
   * @property {Array} Array of field objects
   */
  fields: undefined,

  /**
   * @property {String} primaryKeyTag - name of the primary key tag
   */
  primaryKeyTag: 'primaryKey',

  /**
   * @property {String} description - name of the description tag
   */
  descriptionTag: 'description',

  /**
   * @property {String} idTag - name of the searchable id tag
   */
  idTag: 'id',

  /**
   * @property {String} source - name of the data source this dimension is from.
   */
  source: undefined,

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
  },

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
  },

  /**
   * @property {String} primaryKeyFieldName
   */
  primaryKeyFieldName: computed(function() {
    let tag = get(this, 'primaryKeyTag'),
      field = this.getFieldsForTag(tag)[0] || {};
    return get(field, 'name') || 'id';
  }),

  /**
   * @property {String} descriptionFieldName
   */
  descriptionFieldName: computed(function() {
    let tag = get(this, 'descriptionTag'),
      field = this.getFieldsForTag(tag)[0] || {};
    return get(field, 'name') || 'desc';
  }),

  /**
   * @property {String} idFieldName
   */
  idFieldName: computed(function() {
    let tag = get(this, 'idTag'),
      field = this.getFieldsForTag(tag)[0] || {};
    return get(field, 'name') || get(this, 'primaryKeyFieldName');
  }),

  /**
   * @property {Promise} extended
   */
  extended: computed(function() {
    const { metadata, name, type, source } = this;
    return ObjectProxy.extend(PromiseProxyMixin).create({
      promise: metadata.findById(type, name, source)
    });
  })
});

//factory level properties
export default Model.reopenClass({
  /**
   * @property {String} identifierField - used by the keg as identifierField
   */
  identifierField: 'name'
});
