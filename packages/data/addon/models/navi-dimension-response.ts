/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NativeWithCreate from 'navi-data/models/native-with-create';
import type NaviDimensionModel from 'navi-data/models/navi-dimension';
import type { ResponseV1 } from 'navi-data/serializers/facts/interface';

interface NaviDimensionResponsePayload {
  values: NaviDimensionModel[];
  meta?: ResponseV1['meta'];
}

export default class NaviDimensionResponse extends NativeWithCreate {
  constructor(owner: unknown, args: NaviDimensionResponsePayload) {
    super(owner, args);
    this.values = this.values ?? [];
    this.meta = this.meta ?? {};
  }
  declare readonly values: NaviDimensionModel[];
  declare readonly meta?: ResponseV1['meta'];
}
