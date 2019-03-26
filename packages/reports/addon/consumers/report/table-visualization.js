/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { assert } from '@ember/debug';

import { assign } from '@ember/polyfills';
import { set, get } from '@ember/object';
import isEqual from 'lodash/isEqual';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { UpdateReportActions } from 'navi-reports/services/update-report-action-dispatcher';
import keyBy from 'lodash/keyBy';
import omit from 'lodash/omit';
import { canonicalizeColumnAttributes } from 'navi-data/utils/metric';

export default ActionConsumer.extend({
  actions: {
    /**
     * @action UPDATE_TABLE_COLUMN_ORDER
     * @param {Object} route - report route
     * @param {Object} newColumnOrder - new column order to replace old
     */
    [UpdateReportActions.UPDATE_TABLE_COLUMN_ORDER]({ currentModel: report }, newColumnOrder) {
      assert('Visualization must be a table', get(report, 'visualization.type') === 'table');
      let visualizationMetadata = get(report, 'visualization.metadata'),
        metrics = get(report, 'request.metrics'),
        metricIndex = keyBy(metrics.toArray(), metric => get(metric, 'canonicalName')),
        reorderedMetrics = newColumnOrder
          .filter(column => column.type === 'metric' || column.type === 'threshold')
          .map(column => metricIndex[canonicalizeColumnAttributes(column.attributes)]);

      set(report, 'visualization.metadata', assign({}, visualizationMetadata, { columns: newColumnOrder }));

      set(report, 'request.metrics', reorderedMetrics);
    },

    /**
     * @action UPDATE_TABLE_COLUMN
     * @param {Object} route - report route
     * @param {Object} updatedColumn - updated column object
     */
    [UpdateReportActions.UPDATE_TABLE_COLUMN]({ currentModel: report }, updatedColumn) {
      assert('Visualization must be a table', get(report, 'visualization.type') === 'table');
      let visualizationMetadata = get(report, 'visualization.metadata'),
        newColumns = get(visualizationMetadata, 'columns').map(col => {
          let propsToOmit = ['format'];

          return isEqual(omit(updatedColumn.attributes, propsToOmit), omit(col.attributes, propsToOmit))
            ? updatedColumn
            : col;
        });

      set(report, 'visualization.metadata', assign({}, visualizationMetadata, { columns: newColumns }));
    }
  }
});
