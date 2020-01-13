/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::ValueInput
 *     @filter={{filter}}
 *     @onUpdateFilter={{action "update"}}
 *   />
 */
import Component from '@ember/component';
import { action } from '@ember/object';
import layout from '../../templates/components/filter-values/value-input';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@tagName('')
@templateLayout(layout)
class ValueInput extends Component {
  /**
   * @action setValue
   * @param {String} value - single value to be set in filter
   */
  @action
  setValue(value) {
    this.onUpdateFilter({
      values: [value]
    });
  }
}

export default ValueInput;
