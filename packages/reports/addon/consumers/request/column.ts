/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import type RequestActionDispatcher from 'navi-reports/services/request-action-dispatcher';
import type Route from '@ember/routing/route';
import type { ColumnMetadataModels } from 'navi-core/models/request/base';
import type { Parameters } from '@yavin/client/request';
import type ReportModel from 'navi-core/models/report';
import type ColumnFragment from 'navi-core/models/request/column';
import type MetricMetadataModel from '@yavin/client/models/metadata/metric';
import type TableMetadataModel from '@yavin/client/models/metadata/table';
import type ReportsReportController from 'navi-reports/controllers/reports/report';

export default class ColumnConsumer extends ActionConsumer {
  @service
  declare requestActionDispatcher: RequestActionDispatcher;

  actions = {
    /**
     * @action ADD_COLUMN_WITH_PARAMS
     * @param route - route that has a model that contains a request property
     * @param columnMetadataModel - metadata model to add
     * @param parameters - parameters applied to the column
     */
    [RequestActions.ADD_COLUMN_WITH_PARAMS](
      this: ColumnConsumer,
      route: Route,
      columnMetadataModel: ColumnMetadataModels,
      parameters: Parameters
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const defaultParams = columnMetadataModel.getDefaultParameters() || {};
      const params = { ...defaultParams, ...parameters };
      const column = request.addColumnFromMetaWithParams(columnMetadataModel, params);
      this.requestActionDispatcher.dispatch(RequestActions.DID_ADD_COLUMN, route, column);
    },

    /**
     * @action DID_ADD_COLUMN
     * @param route - route that has a model that contains a request property
     * @param column - column fragment
     */
    [RequestActions.DID_ADD_COLUMN](this: ColumnConsumer, route: Route, column: ColumnFragment) {
      const controller = route.controllerFor(route.routeName) as ReportsReportController;
      controller.setLastAddedColumn(column);
    },

    /**
     * @action REMOVE_COLUMN_FRAGMENT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     */
    [RequestActions.REMOVE_COLUMN_FRAGMENT](this: ColumnConsumer, route: Route, column: ColumnFragment) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.removeColumn(column);
    },

    /**
     * @action UPDATE_COLUMN_FRAGMENT_WITH_PARAMS
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     * @param parameterKey - the name of the parameter to update
     * @param parameterValue - the value to update the parameter with
     */
    [RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS](
      this: ColumnConsumer,
      _route: Route,
      column: ColumnFragment,
      parameterKey: keyof Parameters,
      parameterValue: Parameters[string]
    ) {
      column.updateParameters({ [parameterKey]: parameterValue });
    },

    /**
     * @action RENAME_COLUMN_FRAGMENT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     * @param alias - the new name for the column
     */
    [RequestActions.RENAME_COLUMN_FRAGMENT](
      this: ColumnConsumer,
      route: Route,
      column: ColumnFragment,
      alias: ColumnFragment['alias']
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.renameColumn(column, alias);
    },

    /**
     * @action REORDER_COLUMN_FRAGMENT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     * @param index - the index to move the selected column
     */
    [RequestActions.REORDER_COLUMN_FRAGMENT](
      this: ColumnConsumer,
      route: Route,
      column: ColumnFragment,
      index: number
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.reorderColumn(column, index);
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param route - route that has a model that contains a request property
     * @param metricMetadataModel - metadata model of metric whose filter is being added
     * @param parameters - parameters applied to the column
     */
    [RequestActions.ADD_METRIC_FILTER](
      this: ColumnConsumer,
      route: Route,
      metricMetadataModel: MetricMetadataModel,
      parameters?: Parameters
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      // Metric filter can't exist without the metric present in the request

      if (request.columns.find((column) => column.type === 'metric' && column.columnMetadata === metricMetadataModel)) {
        // When adding a metric filter with the requestPreview, users can add multiple of the same metric
        // So if the metric already exists we assume they don't want to add it again
        return;
      }

      this.requestActionDispatcher.dispatch(
        RequestActions.ADD_COLUMN_WITH_PARAMS,
        route,
        metricMetadataModel,
        parameters
      );
    },

    /**
     * @action DID_UPDATE_TABLE
     * @param route - route that has a model that contains a request property
     * @param table - table that the request is updated with
     */
    [RequestActions.DID_UPDATE_TABLE](this: ColumnConsumer, route: Route, table: TableMetadataModel) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const { metrics, dimensions, timeDimensions } = table;
      const validColumns = [...metrics, ...dimensions, ...timeDimensions];

      /*
       * .toArray() is used to clone the array, otherwise removing a column while
       * iterating over `request.columns` causes problems
       */
      request.columns.toArray().forEach((column) => {
        if (!validColumns.includes(column.columnMetadata)) {
          this.requestActionDispatcher.dispatch(RequestActions.REMOVE_COLUMN_FRAGMENT, route, column);
        }
      });
    },
  };
}
