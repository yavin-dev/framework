/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import BaseValidator from 'ember-cp-validations/validators/base';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

type ValidatorOptions = {
  request: RequestFragment;
};

export default class RequestMetricExists extends BaseValidator {
  validate(value: string, options: ValidatorOptions /* model, attribute */) {
    const { request } = options;
    if (value && request) {
      return request.metricColumns.some(({ cid }) => cid === value);
    }
    return false;
  }
}
