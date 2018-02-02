/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import { getApiErrMsg } from 'navi-core/utils/error';

export function errorMessage([error]) {
  return getApiErrMsg(error);
}

export default Ember.Helper.helper(errorMessage);
