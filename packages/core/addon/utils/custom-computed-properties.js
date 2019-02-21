/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { computed } from '@ember/object';

import { makeArray } from '@ember/array';

/**
 * Computed property to get the set difference of two array properties.
 * This property is a substitute for Ember.computed.setDiff, which  modifies the order of the result.
 *
 * @method computedSetDiff
 * @param {String} setAProperty
 * @param {String} setBProperty
 * @returns {Ember.computed} - Returns computed property giving set difference i.e. setA - setB
 */
export function computedSetDiff(setAProperty, setBProperty) {
  return computed(setAProperty, setBProperty, function() {
    let setA = makeArray(this.get(setAProperty)),
      setB = makeArray(this.get(setBProperty));
    return setA.filter(element => setB.indexOf(element) === -1);
  });
}
