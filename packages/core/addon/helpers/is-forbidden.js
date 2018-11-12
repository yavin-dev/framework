/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Util for testing if a RSVP Promise was rejected because of an ajax forbidden(403) response
 */
import { helper as buildHelper } from '@ember/component/helper';

export function isForbidden(reason) {
  return reason.status === 403;
}

export default buildHelper(([reason]) => isForbidden(reason));
