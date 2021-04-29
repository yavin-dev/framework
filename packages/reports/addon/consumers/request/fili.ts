/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { inject as service } from '@ember/service';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { getDataSource } from 'navi-data/utils/adapter';
import { valuesForOperator } from 'navi-reports/components/filter-builders/time-dimension';
import { getPeriodForGrain } from 'navi-data/utils/date';
import { GrainOrdering } from 'navi-data/models/metadata/bard/table';
import moment from 'moment';
import Interval from 'navi-data/utils/classes/interval';
import type RequestActionDispatcher from 'navi-reports/services/request-action-dispatcher';
import type ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import type ReportModel from 'navi-core/models/report';
import type DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { Filter, Parameters } from 'navi-data/adapters/facts/interface';
import type Route from '@ember/routing/route';
import type { Grain } from 'navi-data/utils/date';
import type FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';

export default class FiliConsumer extends ActionConsumer {
  @service
  declare requestActionDispatcher: RequestActionDispatcher;

  /**
   * Filters actions to only those updating fili requests
   */
  shouldConsumeAction(_actionName: string, route: Route) {
    const { routeName } = route;
    const { request } = route.modelFor(routeName) as ReportModel;
    const { type } = getDataSource(request.dataSource);

    return type === 'bard';
  }

  expandFilterInterval(route: Route, dateTimeFilter: FilterFragment, newGrain: Grain) {
    let values;
    if (dateTimeFilter.operator === 'bet') {
      const oldGrain = dateTimeFilter.parameters.grain as Grain;
      let [start, end] = dateTimeFilter.values as string[];
      if (typeof end === 'string' && moment.utc(end).isValid()) {
        if (GrainOrdering[oldGrain] > GrainOrdering[newGrain]) {
          end = moment
            .utc(end as string)
            .add(1, getPeriodForGrain(oldGrain))
            .subtract(1, getPeriodForGrain(newGrain))
            .toISOString();
        } else {
          const interval = Interval.parseInclusive(start, end, oldGrain).asMomentsInclusive(newGrain);
          start = interval.start.toISOString();
          end = interval.end.toISOString();
        }
        values = [start, end];
      }
    }

    const changeset = {
      parameters: { ...dateTimeFilter.parameters, grain: newGrain },
      ...(values ? { values } : {}),
    };
    this.requestActionDispatcher.dispatch(RequestActions.UPDATE_FILTER, route, dateTimeFilter, changeset);
  }

  actions = {
    /**
     * @action UPDATE_COLUMN_FRAGMENT_WITH_PARAMS
     * @param route - route that has a model that contains a request property
     * @param filterFragment - data model fragment of the filter
     * @param changeset - the filter properties to update
     */
    [RequestActions.UPDATE_FILTER](
      this: FiliConsumer,
      route: Route,
      filterFragment: FilterFragment,
      changeset: Pick<Filter, keyof Filter>
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const { dateTimeFilter } = request;

      const newGrain = changeset.parameters?.grain;
      // the grain was updated but no values were specified
      if (dateTimeFilter === filterFragment && newGrain) {
        const values = valuesForOperator(dateTimeFilter, newGrain as Grain);
        const changeset = { values };
        this.requestActionDispatcher.dispatch(RequestActions.UPDATE_FILTER, route, dateTimeFilter, changeset);
      }

      const { timeGrainColumn } = request;
      if (newGrain && timeGrainColumn && timeGrainColumn.parameters.grain !== newGrain) {
        // update filterFragment before dispatch to prevent infinite loop
        filterFragment.setProperties(changeset);
        this.requestActionDispatcher.dispatch(
          RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
          route,
          timeGrainColumn,
          'grain',
          newGrain
        );
      }
    },

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

      const { dateTimeFilter } = request;
      // If the date time grain was updated
      if (columnFragment.type === 'timeDimension' && parameterKey === 'grain') {
        // and there is a date time filter, update filter grain to match
        if (dateTimeFilter && dateTimeFilter.parameters.grain !== parameterValue) {
          this.expandFilterInterval(route, dateTimeFilter, parameterValue as Grain);
        }

        // update all other date time grains to match
        request.columns
          .filter((c) => c.type === 'timeDimension' && c !== columnFragment)
          .forEach((dateTimeColumn) => {
            if (dateTimeColumn.parameters.grain !== parameterValue) {
              this.requestActionDispatcher.dispatch(
                RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
                route,
                dateTimeColumn,
                'grain',
                parameterValue
              );
            }
          });
      }
    },

    /**
     * @action ADD_DIMENSION_FILTER
     * @param route - route that has a model that contains a request property
     * @param dimension - dimension to filter
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
    },

    /**
     * @action DID_ADD_COLUMN
     * @param route - route that has a model that contains a request property
     * @param column - column fragment
     */
    [RequestActions.DID_ADD_COLUMN](this: FiliConsumer, route: Route, column: ColumnFragment) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const { timeGrainColumn, dateTimeFilter } = request;
      const existingGrain = dateTimeFilter?.parameters?.grain || timeGrainColumn?.parameters?.grain;
      // if a date time column was added and there is an existing grain, update the grain to match
      if (column.type === 'timeDimension' && existingGrain && column.parameters.grain !== existingGrain) {
        this.requestActionDispatcher.dispatch(
          RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
          route,
          column,
          'grain',
          existingGrain
        );
      }
    },
  };
}
