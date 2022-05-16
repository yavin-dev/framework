/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { setProperties } from '@ember/object';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import RequestActionDispatcher, { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import {
  findDefaultOperator,
  getDefaultValuesForTimeFilter,
} from 'navi-reports/components/filter-builders/time-dimension';
import type FilterFragment from 'navi-core/models/request/filter';
import type MetricMetadataModel from 'navi-data/models/metadata/metric';
import type ColumnFragment from 'navi-core/models/request/column';
import type ReportModel from 'navi-core/models/report';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { Parameters } from 'navi-data/adapters/facts/interface';
import type TableMetadataModel from 'navi-data/models/metadata/table';
import type ReportsReportController from 'navi-reports/controllers/reports/report';

const DEFAULT_METRIC_FILTER: { operator: FilterFragment['operator']; values: FilterFragment['values'] } = {
  operator: 'gt',
  values: [0],
};

export default class FilterConsumer extends ActionConsumer {
  @service
  declare requestActionDispatcher: RequestActionDispatcher;

  actions = {
    [RequestActions.ADD_FILTER](this: FilterConsumer, route: Route, column: ColumnFragment) {
      const { columnMetadata, type, parameters } = column;

      if (type === 'metric') {
        this.requestActionDispatcher.dispatch(RequestActions.ADD_METRIC_FILTER, route, columnMetadata, parameters);
      } else {
        this.requestActionDispatcher.dispatch(RequestActions.ADD_DIMENSION_FILTER, route, columnMetadata, parameters);
      }
    },

    /**
     * @action ADD_DIMENSION_FILTER
     * @param route - route that has a model that contains a request property
     * @param dimension - dimension to filter
     */
    [RequestActions.ADD_DIMENSION_FILTER](
      this: FilterConsumer,
      route: Route,
      dimensionMetadataModel: DimensionMetadataModel,
      parameters: Parameters
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const defaultOperator = findDefaultOperator(dimensionMetadataModel.valueType);
      const defaultParams = dimensionMetadataModel.getDefaultParameters() || {};
      const filter = {
        type: dimensionMetadataModel.metadataType,
        source: dimensionMetadataModel.source,
        field: dimensionMetadataModel.id,
        parameters: { ...defaultParams, ...parameters },
        operator: defaultOperator,
        values: [],
      };
      let values;
      if (dimensionMetadataModel.metadataType === 'timeDimension' && defaultOperator === 'bet') {
        values = getDefaultValuesForTimeFilter(filter);
      }

      const newFilter = request.addFilter({
        ...filter,
        ...(values ? { values } : {}),
      });
      this.requestActionDispatcher.dispatch(RequestActions.DID_ADD_FILTER, route, newFilter);
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param route - route that has a model that contains a request property
     * @param metric - metric to filter
     * @param parameters - metric parameters to filter [optional]
     */
    [RequestActions.ADD_METRIC_FILTER](
      this: FilterConsumer,
      route: Route,
      metricMetadataModel: MetricMetadataModel,
      parameters: Parameters
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const defaultParams = metricMetadataModel.getDefaultParameters() || {};
      const newFilter = request.addFilter({
        ...DEFAULT_METRIC_FILTER,
        type: metricMetadataModel.metadataType,
        source: metricMetadataModel.source,
        field: metricMetadataModel.id,
        parameters: { ...defaultParams, ...parameters },
      });
      this.requestActionDispatcher.dispatch(RequestActions.DID_ADD_FILTER, route, newFilter);
    },

    /**
     * @action DID_ADD_FILTER
     * @param route - route that has a model that contains a request property
     * @param filter - filter fragment
     */
    [RequestActions.DID_ADD_FILTER](this: FilterConsumer, route: Route, filter: FilterFragment) {
      const controller = route.controllerFor(route.routeName) as ReportsReportController;
      controller.isFiltersCollapsed = false;
      controller.setLastAddedFilter?.(filter);
    },

    [RequestActions.UPDATE_FILTER](_route: Route, originalFilter: FilterFragment, changeSet: object) {
      setProperties(originalFilter, changeSet);
    },

    [RequestActions.REMOVE_FILTER](route: Route, filter: FilterFragment) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.removeFilter(filter);
    },

    /**
     * @action DID_UPDATE_TABLE
     * @param route - route that has a model that contains a request property
     * @param table - table that the request is updated with
     */
    [RequestActions.DID_UPDATE_TABLE](this: FilterConsumer, route: Route, table: TableMetadataModel) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const { metrics, dimensions, timeDimensions } = table;
      const validColumns = [...metrics, ...dimensions, ...timeDimensions];

      /*
       * .toArray() is used to clone the array, otherwise removing a column while
       * iterating over `request.columns` causes problems
       */
      request.filters.toArray().forEach((filter) => {
        if (!validColumns.includes(filter.columnMetadata)) {
          this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, filter);
        }
      });
    },
  };
}
