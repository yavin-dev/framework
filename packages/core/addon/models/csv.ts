/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import DeliveryFormatFragment, { TypedDeliveryFormat } from './fragments/delivery-format';

export type CSVFormatConfig = {
  type: 'csv';
  options?: Record<string, never>;
};

export default class CSVFormat extends DeliveryFormatFragment implements TypedDeliveryFormat, CSVFormatConfig {
  @attr('string')
  declare type: CSVFormatConfig['type'];

  @attr({ defaultValue: () => ({}) })
  declare options: CSVFormatConfig['options'];
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    csv: CSVFormat;
  }
}
