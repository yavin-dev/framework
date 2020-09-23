/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';

export default interface ValuesComponentArgs {
  filter: FilterFragment;
  isCollapsed: boolean;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
}
