/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import type NaviDimensionModel from 'navi-data/models/navi-dimension';
import type { ResponseV1 } from 'navi-data/serializers/facts/interface';

export default class NaviDimensionResponse extends EmberObject {
  readonly values: NaviDimensionModel[] = [];
  readonly meta?: ResponseV1['meta'] = {};
}
