/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::MultiValueInput
 *     @filter={{this.filter}}
 *     @onUpdateFilter={{this.update}}
 *   />
 */
import Component from '@ember/component';
import { set, action } from '@ember/object';
import layout from '../../templates/components/filter-values/multi-value-input';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class MultiValueInput extends Component {
  /**
   * @method init
   * @override
   */
  init() {
    super.init(...arguments);
    const tags = this.filter.values || [];
    set(this, 'tags', tags);
  }

  /**
   * @action addValue
   * @param {String} value - Add single value to the filter values list
   */
  @action
  addValue(tag) {
    const { tags } = this;
    tags.push(tag);

    this.onUpdateFilter({
      rawValues: tags.slice()
    });
  }

  /**
   * @action removeValueAtIndex
   * @param {String} value - Removes a single value from the filter values list
   */
  @action
  removeValueAtIndex(index) {
    const { tags } = this;
    tags.splice(index, 1);

    this.onUpdateFilter({
      rawValues: tags.slice()
    });
  }
}

export default MultiValueInput;
