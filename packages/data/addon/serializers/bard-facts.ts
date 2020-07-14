/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard response
 */

import EmberObject from '@ember/object';
import NaviFactSerializer, { ResponseV1 } from './fact-interface';
import { RequestV1, RequestV2 } from 'navi-data/adapters/fact-interface';

export default class BardFactsSerializer extends EmberObject implements NaviFactSerializer {
  /**
   * Normalizes bard/fili response into ResponseV1
   * @param payload {AsyncQueryResponse} - payload to normalize
   * @param request {RequestV1} - request for response payload
   * @returns {ResponseV1}
   */
  normalize(payload: ResponseV1, _request: RequestV1 | RequestV2): ResponseV1 | undefined {
    if (payload) {
      return {
        rows: payload.rows,
        meta: payload.meta || {}
      };
    }
    return undefined;
  }
}
