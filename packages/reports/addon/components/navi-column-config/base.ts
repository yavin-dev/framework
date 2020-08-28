/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Base Component
 *
 * Usage:
 *  <NaviColumnConfig::Base
 *    @column={{this.column}}
 *    @metadata={{this.visualization.metadata}}
 *    @onUpdateColumnName={{this.onUpdateColumnName}}
 *  />
 */
import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

interface NaviColumnConfigBaseArgs {
  column: TODO;
  metadata: TODO;
  onUpdateColumnName: (newColumnName: string) => void;
}

export default class NaviColumnConfigBase extends Component<NaviColumnConfigBaseArgs> {
  classId = guidFor(this);

  get apiColumnName(): string {
    return this.args.column.fragment.columnMetadata.id;
  }
}
