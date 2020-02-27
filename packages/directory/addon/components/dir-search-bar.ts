/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirSearchBar
 *   @query={{@query}}
 *   @searchFor={{this.searchFor}}
 * />
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';

interface DirSearchBarComponentArgs {
  searchFor: (value: string) => void;
  query: string;
}

export default class DirSearchBarComponent extends Component<DirSearchBarComponentArgs> {
  @action
  searchInput({ target = {} as HTMLInputElement }) {
    this.args.searchFor?.(target.value);
  }
}
