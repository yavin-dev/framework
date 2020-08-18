/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import BaseFragment from './base';
import { Column } from 'navi-data/adapters/facts/interface';

/**
 * @augments {BaseFragment}
 */
export default class ColumnFragment extends BaseFragment implements Column {
  @attr('string')
  alias?: string | null;
}
