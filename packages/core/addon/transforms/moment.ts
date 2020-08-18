/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import moment, { Moment } from 'moment';
//@ts-ignore
import DateUtils from 'navi-core/utils/date';

export default class MomentTransform extends DS.Transform {
  /**
   * Deserializes date string into a moment object
   *
   * @method deserialize
   * @param {String} serialized - Date string to deserialize
   * @returns {Moment} - Moment object
   */
  deserialize(serialized: string): Moment | null {
    if (serialized) {
      const result = moment.utc(serialized, DateUtils.API_DATE_FORMAT_STRING);
      return moment.isMoment(result) && result.isValid() ? result : null;
    } else {
      return null;
    }
  }

  /**
   * Serializes moment object into a date string
   *
   * @method serialize
   * @param {Moment} deserialized - Moment object to serialize
   * @returns {String} - Date string
   */
  serialize(deserialized: Moment) {
    return moment.isMoment(deserialized) ? deserialized.format(DateUtils.API_DATE_FORMAT_STRING) : null;
  }
}

declare module 'ember-data/types/registries/transform' {
  export default interface TransformRegistry {
    moment: MomentTransform;
  }
}
