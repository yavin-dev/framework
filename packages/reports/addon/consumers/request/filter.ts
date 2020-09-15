/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { setProperties, set } from '@ember/object';
import { assert } from '@ember/debug';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import RequestActionDispatcher, { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import {
  getSelectedMetricsOfBase,
  getFilteredMetricsOfBase,
  getUnfilteredMetricsOfBase
} from 'navi-reports/utils/request-metric';
import MetricMetadataModel from 'navi-data/models/metadata/metric';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import ReportModel from 'navi-core/models/report';
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import { Parameters } from 'navi-data/adapters/facts/interface';
import ColumnMetadataModel from 'navi-data/models/metadata/column';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import RequestFragment from 'navi-core/addon/models/bard-request-v2/request';

const DEFAULT_METRIC_FILTER = {
  operator: 'gt',
  values: [0]
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
    [RequestActions.TOGGLE_FILTER](this: FilterConsumer, route: Route, column: ColumnFragment) {
      const { canonicalName, columnMetadata, type, parameters } = column;
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const filter = request.filters.find(filter => filter.canonicalName === canonicalName);

      //do not add filter if it already exists
      if (!filter) {
        switch (type) {
          case 'metric':
            this.requestActionDispatcher.dispatch(RequestActions.ADD_METRIC_FILTER, route, columnMetadata, parameters);
            break;
          case 'dimension':
            this.requestActionDispatcher.dispatch(RequestActions.ADD_DIMENSION_FILTER, route, columnMetadata);
            break;
          case 'timeDimension':
            throw new Error('TODO');
        }
      } else {
        //TODO fix me
        this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, column);
      }
    },

    [RequestActions.TOGGLE_DIMENSION_FILTER](
      this: FilterConsumer,
      route: Route,
      dimensionMetadataModel: DimensionMetadataModel
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const filter = request.filters.find(
        ({ type, columnMetadata }) =>
          ['dimension', 'timeDimension'].includes(type) && columnMetadata === dimensionMetadataModel
      );

      //do not add filter if it already exists
      if (!filter) {
        this.requestActionDispatcher.dispatch(RequestActions.ADD_DIMENSION_FILTER, route, dimensionMetadataModel);
      } else {
        this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, filter);
      }
    },

    /**
     * @action ADD_DIMENSION_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - dimension to filter
     */
    [RequestActions.ADD_DIMENSION_FILTER](route: Route, dimensionMetadataModel: DimensionMetadataModel) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      assert(
        'Dimension model has correct primaryKeyFieldName',
        typeof dimensionMetadataModel?.primaryKeyFieldName === 'string'
      );

      const findDefaultOperator = (type: string) => {
        const opDictionary: Record<string, string> = {
          date: 'gte',
          number: 'eq',
          default: 'in'
        };

        return opDictionary[type] || opDictionary.default;
      };

      let defaultOperator = findDefaultOperator(dimensionMetadataModel.valueType);

      request.addFilter({
        type: dimensionMetadataModel.metadataType,
        source: dimensionMetadataModel.source,
        field: dimensionMetadataModel.id,
        parameters: dimensionMetadataModel.getDefaultParameters(),
        operator: defaultOperator,
        values: []
      });
    },

    /**
     * @action ADD_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metric - metric to filter
     * @param {Object} [parameters] - metric parameters to filter [optional]
     */
    [RequestActions.ADD_METRIC_FILTER](route: Route, metricMetadataModel: MetricMetadataModel, parameters: Parameters) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.addFilter({
        type: 'metric',
        source: request.dataSource,
        field: metricMetadataModel.id,
        parameters,
        ...DEFAULT_METRIC_FILTER
      });
    },

    /**
     * @action TOGGLE_METRIC_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} metricMetadataModel - metric to filter
     */
    [RequestActions.TOGGLE_METRIC_FILTER](
      this: FilterConsumer,
      route: Route,
      metricMetadataModel: MetricMetadataModel
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const metricFilters = getFilteredMetricsOfBase(metricMetadataModel, request);

      const nextParameter = this._getNextParameterForMetric(metricMetadataModel, request);
      const shouldAdd = !!nextParameter || !metricFilters.length;

      if (shouldAdd) {
        this.requestActionDispatcher.dispatch(
          RequestActions.ADD_METRIC_FILTER,
          route,
          metricMetadataModel,
          nextParameter
        );
      } else {
        metricFilters.forEach(filter => {
          this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, filter);
        });
      }
    },

    [RequestActions.TOGGLE_PARAMETERIZED_METRIC_FILTER](
      this: FilterConsumer,
      route: Route,
      metricMetadataModel: MetricMetadataModel,
      parameters: Parameters
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const filter = request.filters.find(
        filter =>
          filter.type === 'metric' &&
          filter.canonicalName === canonicalizeMetric({ metric: metricMetadataModel.id, parameters })
      );

      if (!filter) {
        this.requestActionDispatcher.dispatch(RequestActions.ADD_METRIC_FILTER, route, metricMetadataModel, parameters);
      } else {
        this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, filter);
      }
    },

    [RequestActions.REMOVE_COLUMN](this: FilterConsumer, route: Route, columnMetadataModel: ColumnMetadataModel) {
      // Find and remove all filters attached to the column
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const filters = request.filters.filter(filter => filter.columnMetadata === columnMetadataModel);
      filters.forEach(filter => this.requestActionDispatcher.dispatch(RequestActions.REMOVE_FILTER, route, filter));
    },

    [RequestActions.UPDATE_FILTER](_route: Route, originalFilter: FilterFragment, changeSet: object) {
      setProperties(originalFilter, changeSet);
    },

    [RequestActions.REMOVE_FILTER](route: Route, filter: FilterFragment) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.removeFilter(filter);
    }
  };
}
