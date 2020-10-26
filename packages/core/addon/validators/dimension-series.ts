/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import BaseValidator from 'ember-cp-validations/validators/base';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { DimensionSeriesValues } from '../models/chart-visualization';

type ValidatorOptions = {
  request: RequestFragment;
};

export default class DimensionSeriesValidator extends BaseValidator {
  validate(values: DimensionSeriesValues[], options: ValidatorOptions /* model, attribute */) {
    const { request } = options;

    if (values?.length) {
      const seriesDimensions = Object.keys(values[0].values);
      const cids = request.nonTimeDimensions.map(({ cid }) => cid);
      return seriesDimensions.every(dim => cids.includes(dim));
    }
    return false;
  }
}
