/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import type FormatOptions from './format-options';

export default class DeliveryFormatFragment extends Fragment {
  @attr('string')
  declare type: string;

  @fragment('fragments/formatOptions', { defaultValue: {} })
  declare options: FormatOptions;
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'fragments/delivery-format': DeliveryFormatFragment;
  }
}
