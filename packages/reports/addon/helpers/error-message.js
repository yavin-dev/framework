/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import { getApiErrMsg } from 'navi-core/utils/error';

export function errorMessage([error]) {
  return getApiErrMsg(error);
}

export default buildHelper(errorMessage);
