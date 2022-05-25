/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import type { Rollup } from '@yavin/client/request';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  columnCids: [validator('has-many')],
  grandTotal: validator('presence', true),
});

export default class RollupFragment extends Fragment.extend(Validations) implements Rollup {
  @attr({ defaultValue: () => [] })
  declare columnCids: Rollup['columnCids'];

  @attr('boolean', { defaultValue: false })
  declare grandTotal: Rollup['grandTotal'];
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'request/rollup': RollupFragment;
  }
}
