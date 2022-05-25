/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import type { SortDirection } from '@yavin/client/request';

const SORT_ICONS = {
  asc: 'navi-table-sort-icon--asc',
  desc: 'navi-table-sort-icon--desc',
  none: 'navi-table-sort-icon--none',
};

interface Args {
  direction: SortDirection;
}

export default class NaviTableSortIcon extends Component<Args> {
  get sortClass() {
    return SORT_ICONS[this.args.direction];
  }
}
