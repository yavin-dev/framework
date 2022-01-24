/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import DeliveryFormatFragment, { TypedDeliveryFormat } from './fragments/delivery-format';

export type GsheetFormatConfig = {
  type: 'gsheet';
  options?: {
    overwriteFile: boolean;
  };
};

export default class GsheetFormat extends DeliveryFormatFragment implements TypedDeliveryFormat, GsheetFormatConfig {
  @attr('string')
  declare type: GsheetFormatConfig['type'];

  @attr({ defaultValue: () => ({ overwriteFile: false }) })
  declare options: GsheetFormatConfig['options'];
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    gsheet: GsheetFormat;
  }
}
