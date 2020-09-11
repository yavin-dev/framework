/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import BaseFragment from './base';
import { Column } from 'navi-data/adapters/facts/interface';
import { nanoid } from 'nanoid';
import { inject as service } from '@ember/service';
import NaviFormatterService from 'navi-data/services/navi-formatter';

/**
 * @augments {BaseFragment}
 */
export default class ColumnFragment extends BaseFragment implements Column {
  @attr('string', { defaultValue: () => nanoid(10) })
  cid!: string;

  @attr('string')
  alias?: string | null;

  @service naviFormatter!: NaviFormatterService;

  get displayName() {
    const { alias, parameters, columnMetadata } = this;
    return this.naviFormatter.formatColumnName(columnMetadata, parameters, alias);
  }
}
