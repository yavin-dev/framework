/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { dasherize, camelize } from '@ember/string';
import { pluralize, singularize } from 'ember-inflector';
import JSONAPISerializer from '@ember-data/serializer/json-api';
import ModelRegistry from 'ember-data/types/registries/model';

export default class BaseJsonSerializer extends JSONAPISerializer {
  /**
   * Normalize attribute key
   *
   * @override
   * @param attr - attribute name
   * @return normalized key
   */
  keyForAttribute = (attr: string) => attr;

  /**
   * Normalize relationship key
   *
   * @override
   * @param attr - attribute name
   * @return normalized key
   */
  keyForRelationship = (attr: string) => camelize(attr);

  /**
   * Camelize model key
   *
   * @override
   * @param attr - attribute name
   * @return normalized key
   */
  keyForModel = (attr: string) => camelize(attr);

  /**
   * @override
   * @param key - type from payload
   * @return model name
   */
  modelNameFromPayloadKey = (key: string) => dasherize(singularize(key));

  /**
   * @public
   * @param modelname modelName from the record
   * @return payloadType
   */
  payloadKeyFromModelName<K extends keyof ModelRegistry>(modelName: K) {
    return camelize(pluralize(`${modelName}`));
  }
}
