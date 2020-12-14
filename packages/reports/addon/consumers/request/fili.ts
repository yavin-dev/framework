/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import Route from '@ember/routing/route';
import RequestActionDispatcher, { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import ReportModel from 'navi-core/models/report';
import { getDataSource } from 'navi-data/utils/adapter';
import DimensionMetadataModel from 'navi-data/addon/models/metadata/dimension';
import { Parameters } from 'navi-data/adapters/facts/interface';

export default class FiliConsumer extends ActionConsumer {
  @service requestActionDispatcher!: RequestActionDispatcher;

  /**
   * Filters actions to only those updating fili requests
   */
  shouldConsumeAction(_actionName: string, route: Route) {
    const { routeName } = route;
    const { request } = route.modelFor(routeName) as ReportModel;
    const { type } = getDataSource(request.dataSource);

    return type === 'bard';
  }

  actions = {
    /**
     * @action UPDATE_COLUMN_FRAGMENT_WITH_PARAMS
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     * @param parameterKey - the name of the parameter to update
     * @param parameterValue - the value to update the parameter with
     */
    [RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS](
      this: FiliConsumer,
      route: Route,
      columnFragment: ColumnFragment,
      parameterKey: string,
      parameterValue: string
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const { timeGrainColumn, dateTimeFilter } = request;
      if (timeGrainColumn === columnFragment && parameterKey === 'grain' && dateTimeFilter) {
        const changeset = { parameters: { ...dateTimeFilter.parameters, [parameterKey]: parameterValue } };
        this.requestActionDispatcher.dispatch(RequestActions.UPDATE_FILTER, route, dateTimeFilter, changeset);
      }
    },

    /**
     * @action ADD_DIMENSION_FILTER
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - dimension to filter
     */
    [RequestActions.ADD_DIMENSION_FILTER](
      this: FiliConsumer,
      route: Route,
      dimensionMetadataModel: DimensionMetadataModel,
      _parameters: Parameters
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const { dateTimeFilter, timeGrain } = request;
      if (
        dimensionMetadataModel.metadataType === 'timeDimension' &&
        dimensionMetadataModel === dateTimeFilter?.columnMetadata &&
        timeGrain &&
        dateTimeFilter.parameters.grain !== timeGrain
      ) {
        const changeset = { parameters: { ...dateTimeFilter.parameters, grain: timeGrain } };
        this.requestActionDispatcher.dispatch(RequestActions.UPDATE_FILTER, route, dateTimeFilter, changeset);
      }
    }
  };
}
