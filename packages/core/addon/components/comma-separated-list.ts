/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Takes a list of strings and formats them to be used within an english sentence.
 * The strings will be joined with a "," with "and" before the last item.
 *
 * Usage:
 *   {{~#comma-separated-list list=list as |item| ~}}
 *      <span class='custom-element'>{{item}}</span>
 *   {{~/comma-separated-list~}}
 */
import Component from '@glimmer/component';

interface Args {
  list: unknown[];
}

export default class CommaSeparatedList extends Component<Args> {
  /**
   * the subset of items that need a comma added after them
   */
  get commaItems() {
    return this.args.list.slice(0, -1);
  }
}
