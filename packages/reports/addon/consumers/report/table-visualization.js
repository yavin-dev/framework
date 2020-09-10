/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { assert } from '@ember/debug';
import { assign } from '@ember/polyfills';
import { set } from '@ember/object';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { UpdateReportActions } from 'navi-reports/services/update-report-action-dispatcher';

export default ActionConsumer.extend({
  actions: {
    /**
     * @action UPDATE_TABLE_COLUMN_ORDER
     * @param {Object} route - report route
     * @param {Object} newColumnOrder - new column order to replace old
     */
    [UpdateReportActions.UPDATE_TABLE_COLUMN_ORDER]({ currentModel: report }, newColumnOrder) {
      assert('Visualization must be a table', report.visualization.type === 'table');
      const { metadata } = report.visualization;

      const columnAttributes = newColumnOrder.reduce((columnAttributes, columnInfo, index) => {
        if (columnInfo.attributes) {
          columnAttributes[index] = columnInfo.attributes;
        }
        return columnAttributes;
      }, {});
      const reorderedColumns = newColumnOrder.map(c => c.fragment);

      set(report, 'visualization.metadata', assign({}, metadata, { columnAttributes }));
      set(report, 'request.columns', reorderedColumns);
    },

    /**
     * @action UPDATE_TABLE_COLUMN
     * @param {Object} route - report route
     * @param {Object} updatedColumn - updated column object
     */
    [UpdateReportActions.UPDATE_TABLE_COLUMN]({ currentModel: report }, updatedColumn) {
      assert('Visualization must be a table', report.visualization.type === 'table');
      const { metadata } = report.visualization;
      const columnAttributes = { ...metadata.columnAttributes };
      columnAttributes[updatedColumn.columnId] = updatedColumn.attributes;

      set(report, 'visualization.metadata', assign({}, metadata, { columnAttributes }));
    }
  }
});
