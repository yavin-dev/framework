/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import BaseValidator from 'ember-cp-validations/validators/base';
import { isEqual } from 'lodash-es';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

export default BaseValidator.extend({
  validate(value: string[], { request }: { request: RequestFragment } /*, model, attribute*/) {
    if (request) {
      let requestDimensions = request.nonTimeDimensions.map(c => c.cid);
      return isEqual(value, requestDimensions);
    }
    return undefined;
  }
});
