/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Util for testing if a RSVP Promise was rejected because of an ajax forbidden(403) response
 */
import { helper as buildHelper } from '@ember/component/helper';
import NaviAdapterError from '@yavin/client/errors/navi-adapter-error';
import { AjaxError, isForbiddenError } from 'ember-ajax/errors';

export function isForbidden(reason: unknown): boolean {
  if (reason instanceof NaviAdapterError) {
    return reason.errors.some((error) => error.status === '403');
  } else if (reason instanceof AjaxError || typeof reason === 'number') {
    return isForbiddenError(reason);
  }
  return false;
}

export default buildHelper(([reason]) => isForbidden(reason));
