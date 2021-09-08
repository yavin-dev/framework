/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import { Rollup } from 'navi-data/adapters/facts/interface';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  columns: [validator('has-many')],
  grandTotal: validator('presence', true),
});

export default class RollupFragment extends Fragment.extend(Validations) implements Rollup {
  @attr({ defaultValue: () => [] })
  declare columns: Rollup['columns'];

  @attr('boolean', { defaultValue: false })
  declare grandTotal: Rollup['grandTotal'];
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'bard-request-v2/fragments/rollup': RollupFragment;
  }
}
