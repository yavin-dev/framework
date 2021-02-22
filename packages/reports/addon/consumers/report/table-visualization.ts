/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { assert } from '@ember/debug';
import { set } from '@ember/object';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { UpdateReportActions } from 'navi-reports/services/update-report-action-dispatcher';
import Route from '@ember/routing/route';
import ReportModel from 'navi-core/models/report';
import { TableColumn } from 'navi-core/components/navi-visualizations/table';
import TableVisualization from 'navi-core/models/table';

export default class TableVisualizationConsumer extends ActionConsumer {
  actions = {
    /**
     * @action UPDATE_TABLE_COLUMN_ORDER
     * @param route - report route
     * @param newColumnOrder - new column order to replace old
     */
    [UpdateReportActions.UPDATE_TABLE_COLUMN_ORDER](
      this: TableVisualizationConsumer,
      route: Route,
      newColumnOrder: TableColumn[]
    ) {
      const { routeName } = route;
      const report = route.modelFor(routeName) as ReportModel;
      assert('Visualization must be a table', report.visualization.type === 'table');

      const reorderedColumns = newColumnOrder.map((c) => c.fragment);

      //@ts-expect-error
      set(report.request, 'columns', reorderedColumns);
    },

    /**
     * @action UPDATE_TABLE_COLUMN
     * @param route - report route
     * @param updatedColumn - updated column object
     */
    [UpdateReportActions.UPDATE_TABLE_COLUMN](
      this: TableVisualizationConsumer,
      route: Route,
      updatedColumn: TableColumn
    ) {
      const { routeName } = route;
      const report = route.modelFor(routeName) as ReportModel;
      assert('Visualization must be a table', report.visualization.type === 'table');
      const { metadata } = report.visualization as TableVisualization;
      const columnAttributes = { ...metadata.columnAttributes };
      columnAttributes[updatedColumn.fragment.cid] = updatedColumn.attributes;

      set(report.visualization, 'metadata', { ...metadata, columnAttributes });
    },
  };
}
