/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NativeWithCreate, { Injector } from './native-with-create.js';
import type NaviDimensionModel from './navi-dimension.js';
import type { ResponseV1 } from '../serializers/facts/interface.js';

interface NaviDimensionResponsePayload {
  values: NaviDimensionModel[];
  meta?: ResponseV1['meta'];
}

export default class NaviDimensionResponse extends NativeWithCreate {
  constructor(injector: Injector, args: NaviDimensionResponsePayload) {
    super(injector, args);
    this.values = this.values ?? [];
    this.meta = this.meta ?? {};
  }
  declare readonly values: NaviDimensionModel[];
  declare readonly meta?: ResponseV1['meta'];
}
