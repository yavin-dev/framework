/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::RangeInput
 *     @filter={{filter}}
 *     @onUpdateFilter={{action "update"}}
 *     @lowPlaceholder={{lowPlaceholder}}
 *     @highPlaceholder={{highPlaceholder}}
 *   />
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import Args from './args-interface';
import { readOnly } from '@ember/object/computed';

export default class RangeInput extends Component<Args> {
  // eslint-disable-next-line no-undef
  @readOnly('args.filter.values.0') startDate?: string;

  @readOnly('args.filter.values.1') endDate?: string;
  /**
   * @action setLowValue
   * @param {InputEvent} event
   */
  @action
  setLowValue({ target: { value } }) {
    this.args.onUpdateFilter({
      values: [value, this.args.filter.values[1]]
    });
  }

  /**
   * @action setHighValue
   * @param {InputEvent} event
   */
  @action
  setHighValue({ target: { value } }) {
    this.args.onUpdateFilter({
      values: [this.args.filter.values[0], value]
    });
  }
}
