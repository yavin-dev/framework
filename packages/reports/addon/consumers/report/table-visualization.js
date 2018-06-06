/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import isEqual from 'lodash/isEqual'
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { ReportActions } from 'navi-reports/services/report-action-dispatcher';
import keyBy from 'lodash/keyBy';
import { canonicalizeMetric } from 'navi-data/utils/metric';

const { assign, get, set } = Ember;

export default ActionConsumer.extend({

  actions: {
    /**
     * @action UPDATE_TABLE_COLUMN_ORDER
     * @param {Object} route - report route
     * @param {Object} newColumnOrder - new column order to replace old
     */
    [ReportActions.UPDATE_TABLE_COLUMN_ORDER]({ currentModel:report }, newColumnOrder) {
      Ember.assert('Visualization must be a table', get(report, 'visualization.type') === 'table');
      let visualizationMetadata = get(report, 'visualization.metadata'),
          metrics = get(report, 'request.metrics'),
          metricIndex = keyBy(metrics.toArray(), metric => get(metric, 'canonicalName')),
          reorderedMetrics = newColumnOrder
            .filter(column => column.type === 'metric' || column.type === 'threshold')
            .map(column => metricIndex[canonicalizeMetric(column.field)]);

      set(report, 'visualization.metadata',
        assign({}, visualizationMetadata, { columns: newColumnOrder})
      );

      set(report, 'request.metrics', reorderedMetrics);
    },

    /**
     * @action UPDATE_TABLE_COLUMN
     * @param {Object} route - report route
     * @param {Object} updatedColumn - updated column object
     */
    [ReportActions.UPDATE_TABLE_COLUMN]({ currentModel: report }, updatedColumn) {
      Ember.assert('Visualization must be a table', get(report, 'visualization.type') === 'table');
      let visualizationMetadata = get(report, 'visualization.metadata'),
          newColumns = get(visualizationMetadata, 'columns').map(col =>
            isEqual(updatedColumn.field, col.field) ? updatedColumn : col)

      set(report, 'visualization.metadata',
        assign({}, visualizationMetadata, { columns: newColumns })
      );
    }
  }
});
