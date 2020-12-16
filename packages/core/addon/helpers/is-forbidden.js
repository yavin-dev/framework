/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Util for testing if a RSVP Promise was rejected because of an ajax forbidden(403) response
 */
import { helper as buildHelper } from '@ember/component/helper';
import { isForbiddenError } from 'ember-ajax/errors';
import NaviAdapterError from 'navi-data/errors/navi-adapter-error';

export function isForbidden(reason) {
  if (reason instanceof NaviAdapterError) {
    return reason.errors.some(error => error.status === '403');
  }
  return isForbiddenError(reason);
}

export default buildHelper(([reason]) => isForbidden(reason));
