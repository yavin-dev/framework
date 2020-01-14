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

import Component from '@ember/component';
import { action, get } from '@ember/object';
import layout from '../../templates/components/filter-values/range-input';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@tagName('')
@templateLayout(layout)
class RangeInput extends Component {
  /**
   * @property {String} lowPlaceholder
   */
  lowPlaceholder = 'Low value';

  /**
   * @property {String} highPlaceholder
   */
  highPlaceholder = 'High value';

  /**
   * @action setLowValue
   * @param {InputEvent} event
   */
  @action
  setLowValue({ target: { value } }) {
    this.onUpdateFilter({
      values: [value, get(this, 'filter.values.lastObject')]
    });
  }

  /**
   * @action setHighValue
   * @param {InputEvent} event
   */
  @action
  setHighValue({ target: { value } }) {
    this.onUpdateFilter({
      values: [get(this, 'filter.values.firstObject'), value]
    });
  }
}

export default RangeInput;
