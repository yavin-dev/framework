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
  /**
   * A unique id for this instance of the column config
   */
  get classId(): string {
    return guidFor(this);
  }

  /**
   * The api name for the column
   */
  get apiColumnName(): string {
    const { column } = this.args;
    return column.name === 'dateTime' ? 'dateTime' : column.fragment[column.type].id;
  }
}
