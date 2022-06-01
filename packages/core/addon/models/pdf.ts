/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import DeliveryFormatFragment, { TypedDeliveryFormat } from './fragments/delivery-format';

export type PDFFormatConfig = {
  type: 'pdf';
  options?: Record<string, never>;
};

export default class PDFFormat extends DeliveryFormatFragment implements TypedDeliveryFormat, PDFFormatConfig {
  @attr('string')
  declare type: PDFFormatConfig['type'];

  @attr({ defaultValue: () => ({}) })
  declare options: PDFFormatConfig['options'];
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    pdf: PDFFormat;
  }
}
