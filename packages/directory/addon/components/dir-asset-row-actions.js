/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirAssetRowActions
 *   @value={{assetModel}}
 *   @row={{rowObject}}
 * />
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-asset-row-actions';
import { computed, get } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class DirAssetRowActions extends Component {
  /**
   * @property {String} type - the type of the asset
   */
  @computed('value')
  get type() {
    const { value } = this;
    return value ? value.constructor.modelName : null;
  }

  /**
   * @property {String} rowElement - selector for the row containing this
   */
  @computed('value', 'row.rowId')
  get rowElement() {
    const rowId = get(this, 'row.rowId');
    return `[data-row-id=${rowId}]`;
  }

  /**
   * @property {Object} assetActionComponents - action list component for each asset type
   */
  assetActionComponents = {
    report: 'navi-action-list',
    dashboard: 'dashboard-action-list'
  };
}

export default DirAssetRowActions;
