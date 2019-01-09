/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Util for testing if a RSVP Promise was rejected because of an ajax forbidden(403) response
 */
import Ember from 'ember';

export function isForbidden(reason) {
  return reason.status === 403;
}

export default Ember.Helper.helper(([reason]) => isForbidden(reason));
