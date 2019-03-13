/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { dasherize, camelize } from '@ember/string';
import { pluralize, singularize } from 'ember-inflector';
import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
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
