/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import type { DeliveryFormatType } from 'navi-core/models/registry';

export default class DeliveryFormatFragment extends Fragment {
  @attr('string')
  declare type: string;

  @attr()
  declare options: unknown;
}

export interface TypedDeliveryFormat extends DeliveryFormatFragment {
  type: DeliveryFormatType;
}
