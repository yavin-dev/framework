/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirAssetRowActions
 *   @value={{@assetModel}}
 *   @row={{@rowObject}}
 * />
 */
import Component from '@glimmer/component';

export default class DirAssetRowActionsComponent extends Component {
  /**
   * @property {String} type - the type of the asset
   */
  get type() {
    return this.args.value?.constructor?.modelName;
  }

  /**
   * @property {String} rowElement - selector for the row containing this
   */
  get rowElement() {
    const rowId = this.args.row?.rowId;
    return `[data-row-id="${rowId}"]`;
  }

  /**
   * @property {Object} assetActionComponents - action list component for each asset type
   */
  assetActionComponents = {
    report: 'navi-action-list',
    dashboard: 'dashboard-action-list'
  };
}
