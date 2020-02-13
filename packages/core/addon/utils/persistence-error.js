/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { get } from '@ember/object';
import { capitalize, last } from 'lodash-es';

/**
 * Returns formatted message based on error object
 * @function getApiErrorMsg
 * @param {Object} error - error object from ajax service
 * @returns {String} formatted error message
 */
export function getApiErrMsg(error = {}, defaultMsg) {
  let detail = get(error, 'detail');

  if (detail) {
    return capitalize(last(detail[0].split(':')).trim());
  }

  return defaultMsg;
}
