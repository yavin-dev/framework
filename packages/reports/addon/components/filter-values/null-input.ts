/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::NullInput
 *     @filter={{filter}}
 *     @onUpdateFilter={{action "update"}}
 *   />
 */
import Component from '@glimmer/component';
import { isEqual } from 'lodash-es';
import Args from './args-interface';

export default class NullInput extends Component<Args> {
  /**
   * @property {String} tagName
   */
  tagName = '';

  init() {
    debugger;
    const {
      isCollapsed,
      onUpdateFilter,
      filter: { values }
    } = this.args;

    /*
     * Since this operator doesn't require values, set an empty array
     */
    if (!isCollapsed && (isEqual(values, ['""']) || !!values.length)) {
      onUpdateFilter({ values: [] });
    }
  }
}
