/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { assert } from '@ember/debug';
import { assign } from '@ember/polyfills';
import { set } from '@ember/object';
import { isEqual, keyBy, omit } from 'lodash-es';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { UpdateReportActions } from 'navi-reports/services/update-report-action-dispatcher';
import { canonicalizeMetric } from 'navi-data/utils/metric';

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
      const { columns } = report.request;
      const columnIndex = keyBy(columns.toArray(), column => column.canonicalName);
      const reorderedColumns = newColumnOrder.map(
        column => columnIndex[canonicalizeMetric({ metric: column.field, parameters: column.parameters })]
      );

      set(report, 'visualization.metadata', assign({}, metadata, { columns: newColumnOrder }));

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
      const newColumns = metadata?.columns?.map(col => {
        const sameBase = isEqual(omit(updatedColumn, 'attributes'), omit(col, 'attributes'));
        const propsToOmit = ['format', 'displayName'];
        const sameAttrs = isEqual(omit(updatedColumn.attributes, propsToOmit), omit(col.attributes, propsToOmit));

        return sameBase && sameAttrs ? updatedColumn : col;
      });

      set(report, 'visualization.metadata', assign({}, metadata, { columns: newColumns }));
    }
  }
});
