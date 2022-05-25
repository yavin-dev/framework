/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import { validator, buildValidations } from 'ember-cp-validations';
import BaseFragment from '../request/base';
import type { SortDirection, Sort } from '@yavin/client/request';

const Validations = buildValidations({
  direction: validator('inclusion', {
    in: ['asc', 'desc'],
    message: 'The `direction` sort field must equal to `asc` or `desc`',
  }),
});

/**
 * @augments {BaseFragment}
 */
export default class SortFragment extends BaseFragment.extend(Validations) implements Sort {
  @attr('string', { defaultValue: 'desc' })
  declare direction: SortDirection;

  @attr()
  declare cid: string;
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'request/sort': SortFragment;
  }
}
