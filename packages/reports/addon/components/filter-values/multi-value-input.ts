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
import Component from '@glimmer/component';
import { action } from '@ember/object';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import { tracked } from '@glimmer/tracking';

interface MultiValueInputArgs {
  filter: FilterFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}

export default class MultiValueInput extends Component<MultiValueInputArgs> {
  @tracked tags: (string | number)[] = [];

  constructor(owner: unknown, args: MultiValueInputArgs) {
    super(owner, args);

    this.tags = this.args.filter.values || [];
  }

  /**
   * @action addValue
   * @param tag - Add single value to the filter values list
   */
  @action
  addValue(tag: string | number) {
    const { tags } = this;
    tags.push(tag);

    this.args.onUpdateFilter({
      values: tags.slice()
    });
  }

  /**
   * @action removeValueAtIndex
   * @param {Number} index - index of value to remove
   */
  @action
  removeValueAtIndex(index: number) {
    const { tags } = this;
    tags.splice(index, 1);

    this.args.onUpdateFilter({
      values: tags.slice()
    });
  }
}
