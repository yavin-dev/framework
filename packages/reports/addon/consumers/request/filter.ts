/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { setProperties } from '@ember/object';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import RequestActionDispatcher, { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { getSelectedMetricsOfBase, getUnfilteredMetricsOfBase ,
} from 'navi-reports/utils/request-metric';
import MetricMetadataModel from 'navi-data/models/metadata/metric';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import ReportModel from 'navi-core/models/report';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import { Parameters } from 'navi-data/adapters/facts/interface';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import TableMetadataModel from 'navi-data/models/metadata/table';
import { OPERATORS, valuesForOperator } from 'navi-reports/components/filter-builders/time-dimension';
import { Grain } from 'navi-data/utils/date';

const DEFAULT_METRIC_FILTER: { operator: FilterFragment['operator']; values: FilterFragment['values'] } = {
  operator: 'gt',
  values: [0],
};

export default class FilterConsumer extends ActionConsumer {
  @service
  requestActionDispatcher!: RequestActionDispatcher;

  /**
   * @method _getNextParameterForMetric
   *
   *
   * @private
   * @param metricMetadataModel - metadata object of metric
   * @param request - request fragment
   * @returns {Object|undefined} next parameters object
   */
  _getNextParameterForMetric(metricMetadataModel: MetricMetadataModel, request: RequestFragment) {
    if (!metricMetadataModel.hasParameters) {
      return;
    }

    if (!getSelectedMetricsOfBase(metricMetadataModel, request).length) {
      return metricMetadataModel.getDefaultParameters();
    }

    const nextUnfilteredMetric = getUnfilteredMetricsOfBase(metricMetadataModel, request)[0];
    return nextUnfilteredMetric?.parameters;
  }

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
      route: Route,
      dimensionMetadataModel: DimensionMetadataModel,
      parameters: Parameters
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const findDefaultOperator = (type: string) => {
        type = type?.toLowerCase();
        const opDictionary: Record<string, FilterFragment['operator']> = {
          time: 'gte',
          date: 'bet',
          number: 'eq',
          default: 'in',
        };

        return opDictionary[type] || opDictionary.default;
      };

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
      if (dimensionMetadataModel.metadataType === 'timeDimension') {
        values = valuesForOperator(filter, filter.parameters.grain as Grain, OPERATORS.lookback);
      }

      request.addFilter({
        ...filter,
        ...(values ? { values } : {})
      });
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param route - route that has a model that contains a request property
     * @param metric - metric to filter
     * @param parameters - metric parameters to filter [optional]
     */
    [RequestActions.ADD_METRIC_FILTER](route: Route, metricMetadataModel: MetricMetadataModel, parameters: Parameters) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const defaultParams = metricMetadataModel.getDefaultParameters() || {};
      request.addFilter({
        type: metricMetadataModel.metadataType,
        source: request.dataSource,
        field: metricMetadataModel.id,
        parameters: { ...defaultParams, ...parameters },
        ...DEFAULT_METRIC_FILTER,
      });
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
