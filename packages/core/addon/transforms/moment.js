/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import moment from 'moment';
import DateUtils from 'navi-core/utils/date';

export default DS.Transform.extend({

  /**
   * Deserializes date string into a moment object
   *
   * @method deserialize
   * @param {String} serialized - Date string to deserialize
   * @returns {Moment} - Moment object
   */
  deserialize: function(serialized) {
    if (serialized) {
      let result = moment.utc(serialized, DateUtils.API_DATE_FORMAT_STRING);
      if (moment.isMoment(result) && result.isValid()) {
        return result;
      }
      return null;
    } else {
      return serialized;
    }
  },

  /**
   * Serializes moment object into a date string
   *
   * @method serialize
   * @param {Moment} deserialized - Moment object to serialize
   * @returns {String} - Date string
   */
  serialize: function(deserialized) {
    if (moment.isMoment(deserialized)) {
      return deserialized.format(DateUtils.API_DATE_FORMAT_STRING);
    } else {
      return null;
    }
  }
});
