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

export default class DirSearchBarComponent extends Component {
  @action
  searchInput({ target: { value } }) {
    this.args?.searchFor?.(value);
  }
}
