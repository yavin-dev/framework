/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::MultiValueInput
 *     @filter={{this.filter}}
 *     @onUpdateFilter={{this.update}}
 *   />
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import Args from './args-interface';

export default class MultiValueInput extends Component<Args> {
  /**
   * list of filter values
   */
  get tags() {
    return this.args.filter.values || [];
  }

  /**
   * @action addValue
   * @param tag - Add single value to the filter values list
   */
  @action
  addValue(tag: string | number) {
    const tags = [...this.tags, tag];

    this.args.onUpdateFilter({
      values: tags.slice(),
    });
  }

  /**
   * @action removeValueAtIndex
   * @param {Number} index - index of value to remove
   */
  @action
  removeValueAtIndex(index: number) {
    const tags = [...this.tags];
    tags.splice(index, 1);

    this.args.onUpdateFilter({
      values: tags.slice(),
    });
  }
}
