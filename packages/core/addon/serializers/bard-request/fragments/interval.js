/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import Interval from 'navi-core/utils/classes/interval';

export default DS.JSONSerializer.extend({

  /**
   * Converts object with start/end properties into interval
   *
   * @method normalize
   * @param {DS.Model} typeClass - model being normalized
   * @param {Object} hash
   * @returns {Object}
   */
  normalize(typeClass, hash) {
    hash.interval = Interval.parseFromStrings(hash.start, hash.end);

    // Clean start and end as they are not needed by fragment
    delete hash.start;
    delete hash.end;

    return this._super(typeClass, hash);
  },

  /**
   * Converts interval into JSON
   *
   * @param {DS.Snapshot} snapshot
   * @returns {Object} json
   */
  serialize(snapshot) {
    return snapshot.attr('interval').asStrings();
  }
});
