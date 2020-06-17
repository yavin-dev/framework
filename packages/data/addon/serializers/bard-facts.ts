/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard response
 */

import EmberObject from '@ember/object';
import NaviFactSerializer, { ResponseV1 } from './fact-interface';

export default class BardFactsSerializer extends EmberObject implements NaviFactSerializer {
  normalize(payload: ResponseV1): ResponseV1 | undefined {
    if (payload) {
      return {
        rows: payload.rows,
        meta: payload.meta || {}
      };
    } else {
      return undefined;
    }
  }
}
