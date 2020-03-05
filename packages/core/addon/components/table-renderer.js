/**
 * Copyright 2020, Yahoo Holdings Inc.
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
import { computed } from '@ember/object';
import layout from '../templates/components/table-renderer';
import { formatItemDimension } from '../helpers/mixed-height-layout';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class TableRendererComponent extends Component {
  /**
   * @property {Array} rowDimensions - indicates the dimensions for each row of data
   */
  @computed('tableData')
  get rowDimensions() {
    const rowDimension = formatItemDimension(this.estimateHeight);
    //Create a set of row dimensions for each row of data
    const rowDimensions = new Array(this.tableData?.length);
    for (let i = 0; i < rowDimensions.length; i++) {
      rowDimensions[i] = rowDimension;
    }

    return rowDimensions;
  }
}

export default TableRendererComponent;
