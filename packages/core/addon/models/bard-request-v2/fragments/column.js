/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import BaseFragment from './base';

/**
 * @augments {BaseFragment}
 */
export default class Column extends BaseFragment {
  @attr('string') alias;
}
