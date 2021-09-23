/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { capitalize, last } from 'lodash-es';

/**
 * Returns formatted message based on error object
 * @function getApiErrorMsg
 * @param {Object} error - error object from ajax service
 * @returns {String} formatted error message
 */
export function getApiErrMsg(error = {}, defaultMsg) {
  const { detail } = error;

  if (detail) {
    let message = detail[0];
    message = message.detail ?? message;
    return capitalize(last(message.split(':')).trim());
  }

  return defaultMsg;
}
