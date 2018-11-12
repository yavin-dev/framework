/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

/**
 * @function handleErrors
 *
 * Handles fetch errors
 * @param {Object} response
 * @throws {Error} error object
 * @returns {Object} response object
 */

export function handleErrors(response) {
  if (!response.ok) {
    const { _bodyText: error } = response;
    const errorMsg = IsJsonString(error) ? JSON.parse(error).reason : error;

    throw new Error(errorMsg);
  }
  return response;
}

/**
 * @function IsJsonString
 *
 * @param {String} str
 * @returns {Boolean}
 */
function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
