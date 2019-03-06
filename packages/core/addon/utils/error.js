/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { typeOf } from '@ember/utils';
import { get } from '@ember/object';

const UNKNOWN_ERROR = 'Server Error';

const MESSAGE_OVERRIDES = {
  'The adapter operation timed out': 'Data Timeout',
  'The ajax operation timed out': 'Data Timeout'
};

/**
 * Returns formatted message based on error object
 * @function getApiErrorMsg
 * @param {Object} error - error object from ajax service
 * @returns {String} formatted error message
 */
export function getApiErrMsg(error) {
  let errorText = _getErrorText(error) || UNKNOWN_ERROR;

  if (MESSAGE_OVERRIDES[errorText]) {
    errorText = MESSAGE_OVERRIDES[errorText];
  }

  return errorText;
}

/**
 * Retrieves error message from error object
 * @function _getErrorText
 * @private
 * @param {Object} error - error object from ajax service
 * @returns {String|null} error text
 */
export function _getErrorText(error = {}) {
  let detail = get(error, 'detail'),
    type = typeOf(detail);

  if (type === 'string') {
    return detail;
  } else if (type === 'object') {
    //Bard error messages are present in the description field
    return get(detail, 'description');
  }

  return null;
}
