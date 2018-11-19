/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{#table-renderer
 *   tableData=tableData
 *   request=request
 *   columns=columns
 *   occlusion=occlusion
 *   estimateHeight=estimateHeight
 *   bufferSize=bufferSize
 *   isEditingMode=isEditingMode
 *   cellRendererPrefix=cellRendererPrefix
 *   headerClicked=(action 'headerClicked')
 *   updateColumnOrder=(action 'updateColumnOrder')
 *   updateColumnDisplayName=(action 'updateColumnDisplayName')
 *   onUpdateReport=(action onUpdateReport)
 * }}
 */
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import layout from '../templates/components/table-renderer';
import { formatItemDimension } from '../helpers/mixed-height-layout';

export default Component.extend({
  layout,

  classNames: ['table-widget__horizontal-scroll-container'],

  /**
   * @property {Array} rowDimensions - indicates the dimensions for each row of data
   */
  rowDimensions: computed('tableData', function() {
    let rowDimension = formatItemDimension(get(this, 'estimateHeight'));
    //Create a set of row dimensions for each row of data
    let rowDimensions = new Array(get(this, 'tableData.length'));
    for (let i = 0; i < rowDimensions.length; i++) {
      rowDimensions[i] = rowDimension;
    }

    return rowDimensions;
  })
});
