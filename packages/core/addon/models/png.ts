/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import DeliveryFormatFragment, { TypedDeliveryFormat } from './fragments/delivery-format';

export type PNGFormatConfig = {
  type: 'png';
  options?: Record<string, never>;
};

export default class PNGFormat extends DeliveryFormatFragment implements TypedDeliveryFormat, PNGFormatConfig {
  @attr('string')
  declare type: PNGFormatConfig['type'];

  @attr({ defaultValue: () => ({}) })
  declare options: PNGFormatConfig['options'];
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    png: PNGFormat;
  }
}
