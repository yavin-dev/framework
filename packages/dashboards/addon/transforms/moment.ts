/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Transform from '@ember-data/serializer/transform';
import moment, { Moment } from 'moment';
import { API_DATE_FORMAT_STRING } from '@yavin/client/utils/date';

export default class MomentTransform extends Transform {
  /**
   * Deserializes date string into a moment object
   * @param serialized - Date string to deserialize
   * @returns Moment or null object
   */
  deserialize(serialized: string): Moment | null {
    if (serialized) {
      const result = moment.utc(serialized, API_DATE_FORMAT_STRING);
      return moment.isMoment(result) && result.isValid() ? result : null;
    }
    return null;
  }

  /**
   * Serializes moment object into a date string
   * @param deserialized - Moment object to serialize
   * @returns - Date string or null
   */
  serialize(deserialized: Moment) {
    return moment.isMoment(deserialized) ? deserialized.format(API_DATE_FORMAT_STRING) : null;
  }
}

declare module 'ember-data/types/registries/transform' {
  export default interface TransformRegistry {
    moment: MomentTransform;
  }
}
