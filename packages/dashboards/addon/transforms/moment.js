/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Transform from '@ember-data/serializer/transform';
import moment from 'moment';

const API_DATE_FORMAT_STRING = 'YYYY-MM-DD HH:mm:ss.SSS';

export default class MomentTransform extends Transform {
  /**
   * Deserializes date string into a moment object
   *
   * @method deserialize
   * @param {String} serialized - Date string to deserialize
   * @returns {Moment} - Moment object
   */
  deserialize(serialized) {
    if (serialized) {
      let result = moment.utc(serialized, API_DATE_FORMAT_STRING);
      if (moment.isMoment(result) && result.isValid()) {
        return result;
      }
      return null;
    } else {
      return serialized;
    }
  }

  /**
   * Serializes moment object into a date string
   *
   * @method serialize
   * @param {Moment} deserialized - Moment object to serialize
   * @returns {String} - Date string
   */
  serialize(deserialized) {
    if (moment.isMoment(deserialized)) {
      return deserialized.format(API_DATE_FORMAT_STRING);
    } else {
      return null;
    }
  }
}
