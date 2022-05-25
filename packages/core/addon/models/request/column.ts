/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import BaseFragment from '../request/base';
import type { Column, SortDirection } from '@yavin/client/request';
import { nanoid } from 'nanoid';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
//@ts-ignore
import { fragmentOwner } from 'ember-data-model-fragments/attributes';
import type NaviFormatterService from 'navi-data/services/navi-formatter';
import type { ColumnType } from 'navi-data/models/metadata/column';
import type RequestFragment from 'navi-core/models/request';

/**
 * @augments {BaseFragment}
 */
export default class ColumnFragment<T extends ColumnType = ColumnType> extends BaseFragment<T> implements Column {
  @attr('string', { defaultValue: () => nanoid(10) })
  cid!: string;

  @attr('string')
  alias?: string | null;

  @service naviFormatter!: NaviFormatterService;

  @fragmentOwner() request?: RequestFragment;

  @computed('canonicalName', 'request.sorts.@each.direction')
  get sortedDirection(): SortDirection | null {
    const sorts = this.request?.sorts || [];

    const sort = sorts.find(({ canonicalName }) => canonicalName === this.canonicalName);
    return sort?.direction || null;
  }
}

declare module 'navi-core/models/registry' {
  export interface FragmentRegistry {
    'request/column': ColumnFragment;
  }
}
