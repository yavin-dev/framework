/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';

export default class FormatOptions extends Fragment {
  @attr('boolean')
  declare overwriteFile: boolean;
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'fragments/formatOptions': FormatOptions;
  }
}
