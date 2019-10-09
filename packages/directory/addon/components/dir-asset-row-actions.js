/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{dir-asset-row-action
 *   value=assetModel
 *   row=rowObject
 * }}
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-asset-row-actions';
import { computed, get } from '@ember/object';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['dir-asset-row-actions'],

  /**
   * @property {String} type - the type of the asset
   */
  type: computed('value', function() {
    let { value } = this;

    return value ? value.constructor.modelName : null;
  }),

  /**
   * @property {String} rowElement - selector for the row containing this
   */
  rowElement: computed('value', 'row.rowId', function() {
    let rowId = get(this, 'row.rowId');

    return `[data-row-id=${rowId}]`;
  }),

  /**
   * @property {Object} assetActionComponents - action list component for each asset type
   */
  assetActionComponents: computed(function() {
    return {
      report: 'navi-action-list',
      dashboard: 'dashboard-action-list'
    };
  })
});
