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
    // const { _bodyText: error } = response;
    // const errorMsg = isJsonString(error) ? JSON.parse(error).reason : error;

    // throw new Error(errorMsg);
    throw response;
  }

  return response;
}

/**
 * @function isJsonString
 *
 * @param {String} str
 * @returns {Boolean}
 */
function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
