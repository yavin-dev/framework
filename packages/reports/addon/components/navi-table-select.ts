/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { TableMetadata } from 'navi-data/models/metadata/table';

interface Args {
  options: TableMetadata[];
  selected: TableMetadata;
  searchEnabled: false;
  searchName: string;
  disabled: boolean;
  onChange: (table: TableMetadata) => void;
}

export default class NaviTableSelectComponent extends Component<Args> {
  get searchEnabled() {
    return this.args.searchEnabled || false;
  }

  get searchField() {
    return this.args.searchName || 'name';
  }
}
