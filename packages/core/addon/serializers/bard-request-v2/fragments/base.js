/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import JSONSerializer from '@ember-data/serializer/json';
import { isEmpty } from 'lodash-es';

export default class BaseSerializer extends JSONSerializer {
  /**
   * Called when a record is saved in order to convert the record into JSON.
   * @method serialize
   * @returns {Object} json
   * @override
   */
  serialize() {
    const json = super.serialize(...arguments);

    // removes the 'parameters' key if empty
    if (isEmpty(json.parameters)) {
      delete json.parameters;
    }

    return json;
  }
}
