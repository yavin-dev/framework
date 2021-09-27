/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { capitalize, tail } from 'lodash-es';

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
    const messages = message.split(':');
    message = messages.length > 1 ? tail(messages).join(':') : messages[0];
    return capitalize(message.trim());
  }

  return defaultMsg;
}
