/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import Ember from 'ember';

const { camelize, dasherize, pluralize, singularize } = Ember.String;

export default DS.JSONAPISerializer.extend({
  /**
   * @overide
   * @property {Object} attrs - model attribute config while serialization
   */
  attrs: {
    // Prevent sending below attributes in request payload
    createdOn: { serialize: false },
    updatedOn: { serialize: false }
  },

  /**
   * Normalize attribute key
   *
   * @override
   * @method keyForAttribute
   * @param {String} attr - attribute name
   * @return {String} normalized key
   */
  keyForAttribute: attr => attr,

  /**
   * Normalize relationship key
   *
   * @override
   * @method keyForRelationship
   * @param {String} attr - attribute name
   * @return {String} normalized key
   */
  keyForRelationship: attr => camelize(attr),

  /**
   * Camelize model key
   *
   * @override
   * @method keyForModel
   * @param {String} attr - attribute name
   * @return {String} normalized key
   */
  keyForModel: attr => camelize(attr),

  /**
   * @override
   * @method modelNameFromPayloadKey
   * @param {String} key - type from payload
   * @return {String} model name
   */
  modelNameFromPayloadKey: key => dasherize(singularize(key)),

  /**
   * @method payloadTypeFromModelName
   * @public
   * @param {String} modelname modelName from the record
   * @return {String} payloadType
   */
  payloadKeyFromModelName: modelName => camelize(pluralize(modelName))
});
