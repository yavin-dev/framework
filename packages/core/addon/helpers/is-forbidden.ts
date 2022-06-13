/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Util for testing if a RSVP Promise was rejected because of an ajax forbidden(403) response
 */
import { helper as buildHelper } from '@ember/component/helper';
import NaviAdapterError from '@yavin/client/errors/navi-adapter-error';
import { FetchError } from '@yavin/client/plugins/bard/adapter/facts';

export function isForbidden(reason: unknown): boolean {
  if (reason instanceof NaviAdapterError) {
    return reason.errors.some((error) => error.status === '403');
  } else if (reason instanceof FetchError) {
    return reason.status === 403;
  }
  return false;
}

export default buildHelper(([reason]) => isForbidden(reason));
