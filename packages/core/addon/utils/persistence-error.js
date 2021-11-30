/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { capitalize, tail } from 'lodash-es';

function buildErrMessage(originalErr, defaultMsg) {
  let message = originalErr.detail ?? originalErr;
  const messages = message.split(':');
  message = messages.length > 1 ? tail(messages).join(':') : messages[0];
  message = capitalize(message.trim());
  if (message === '') {
    return defaultMsg;
  }
  return message;
}

/**
 * Returns formatted message based on error object (only top error)
 * @function getApiErrorMsg
 * @param {Object} error - error object from ajax service
 * @returns {String} formatted error message
 */
export function getApiErrMsg(error = {}, defaultMsg) {
  const { detail } = error;

  if (detail) {
    return buildErrMessage(detail[0], defaultMsg);
  }

  return defaultMsg;
}

/**
 * Returns a list of formatted messages based on error object
 * @function getApiErrorMsg
 * @param {Object} error - error object from ajax service
 * @returns {String[]} array of formatted error messages
 */
export function getAllApiErrMsg(error = {}, defaultMsg) {
  const { detail } = error;

  if (detail) {
    const errorMessages = detail.map((ele) => {
      return buildErrMessage(ele, defaultMsg);
    });
    // remove any duplicate errors
    return [...new Set(errorMessages)];
  }

  return [defaultMsg];
}
