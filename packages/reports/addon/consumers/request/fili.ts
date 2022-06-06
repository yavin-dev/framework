/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { getDataSource } from 'navi-data/utils/adapter';
import { valuesForOperator } from 'navi-reports/components/filter-builders/time-dimension';
import { getPeriodForGrain } from '@yavin/client/utils/date';
import { GrainOrdering } from '@yavin/client/models/metadata/bard/table';
import moment from 'moment';
import Interval from '@yavin/client/utils/classes/interval';
import type RequestActionDispatcher from 'navi-reports/services/request-action-dispatcher';
import type ColumnFragment from 'navi-core/models/request/column';
import type ReportModel from 'navi-core/models/report';
import type DimensionMetadataModel from '@yavin/client/models/metadata/dimension';
import type { Filter, Parameters } from '@yavin/client/request';
import type Route from '@ember/routing/route';
import type { Grain } from '@yavin/client/utils/date';
import type FilterFragment from 'navi-core/models/request/filter';
import type SortFragment from 'navi-core/models/request/sort';
import type TableMetadataModel from '@yavin/client/models/metadata/table';

function isFiliDateTime(table: string, col: ColumnFragment | FilterFragment | SortFragment) {
  return col.field.endsWith(`${table}.dateTime`) && col.type === 'timeDimension';
}

export default class FiliConsumer extends ActionConsumer {
  @service
  declare requestActionDispatcher: RequestActionDispatcher;

  /**
   * Filters actions to only those updating fili requests
   */
  shouldConsumeAction(_actionName: string, route: Route) {
    const { routeName } = route;
    const { request } = route.modelFor(routeName) as ReportModel;
    const { dataSource } = request;
    if (dataSource) {
      return getDataSource(dataSource).type === 'bard';
    }
    return false;
  }

  expandFilterInterval(route: Route, dateTimeFilter: FilterFragment, newGrain: Grain) {
    let intervalGrain = newGrain;
    if (newGrain === 'hour' || newGrain === 'minute' || newGrain === 'second') {
      intervalGrain = 'day';
    }
    let values;
    if (dateTimeFilter.operator === 'bet') {
      const oldGrain = dateTimeFilter.parameters.grain as Grain;
      let [start, end] = dateTimeFilter.values as string[];
      if (intervalGrain === oldGrain) {
        // don't update values unnecessarily
      } else if (typeof end === 'string' && moment.utc(end).isValid()) {
        if (GrainOrdering[oldGrain] > GrainOrdering[intervalGrain]) {
          end = moment
            .utc(end as string)
            .add(1, getPeriodForGrain(oldGrain))
            .subtract(1, getPeriodForGrain(intervalGrain))
            .toISOString();
        } else {
          const minGrain = GrainOrdering[oldGrain] < GrainOrdering.day ? 'day' : oldGrain;
          const interval = Interval.parseInclusive(start, end, minGrain).asMomentsInclusive(intervalGrain);
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

      const newGrain = changeset.parameters?.grain;
      // the grain was updated but no values were specified
      if (isFiliDateTime(request.table, filterFragment) && newGrain) {
        const values = valuesForOperator(filterFragment, newGrain as Grain);
        const changeset = { values };
        this.requestActionDispatcher.dispatch(RequestActions.UPDATE_FILTER, route, filterFragment, changeset);
      }

      const filiDateTimeColumns = request.columns.filter((col) => isFiliDateTime(request.table, col));
      if (newGrain && filiDateTimeColumns.some((c) => c.parameters.grain !== newGrain)) {
        // update filterFragment before dispatch to prevent infinite loop
        filterFragment.setProperties(changeset);
        filiDateTimeColumns.forEach((col) => {
          this.requestActionDispatcher.dispatch(
            RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
            route,
            col,
            'grain',
            newGrain
          );
        });
      }

      if (filterFragment.type === 'dimension' && changeset.parameters && !changeset.values) {
        this.requestActionDispatcher.dispatch(RequestActions.UPDATE_FILTER, route, filterFragment, { values: [] });
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

      // If the date time grain was updated
      if (isFiliDateTime(request.table, columnFragment) && parameterKey === 'grain') {
        // and there is a date time filter, update filter grain to match
        request.filters
          .filter((f) => isFiliDateTime(request.table, f) && f.parameters.grain !== parameterValue)
          .forEach((filiDateTimeFilter) =>
            this.expandFilterInterval(route, filiDateTimeFilter, parameterValue as Grain)
          );

        // update all other date time grains to match
        request.columns
          .filter((c) => isFiliDateTime(request.table, c) && c !== columnFragment)
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
      parameters: Parameters = {}
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const filiDateTimeColumn = request.columns.find((col) => isFiliDateTime(request.table, col));
      const requestedGrain = parameters.grain;
      if (
        dimensionMetadataModel.metadataType === 'timeDimension' &&
        dimensionMetadataModel === filiDateTimeColumn?.columnMetadata &&
        requestedGrain &&
        filiDateTimeColumn.parameters.grain !== requestedGrain
      ) {
        request.filters
          .filter((fil) => isFiliDateTime(request.table, fil))
          .forEach((filiDateTimeFilter) => {
            const changeset = {
              parameters: {
                ...filiDateTimeFilter.parameters,
                grain: filiDateTimeColumn.parameters.grain,
              },
            };
            this.requestActionDispatcher.dispatch(RequestActions.UPDATE_FILTER, route, filiDateTimeFilter, changeset);
          });
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

      const filtersAndColumns = [...request.columns.toArray(), ...request.filters.toArray()];
      const filiDateTimes = filtersAndColumns.filter((col) => isFiliDateTime(request.table, col) && col !== column);
      const existingGrain = filiDateTimes.find((col) => col.parameters.grain)?.parameters.grain;
      // if a date time column was added and there is an existing grain, update the grain to match
      if (isFiliDateTime(request.table, column) && existingGrain && column.parameters.grain !== existingGrain) {
        this.requestActionDispatcher.dispatch(
          RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
          route,
          column,
          'grain',
          existingGrain
        );
      }
    },

    /**
     * Before switching to a new table, add that table's dateTime column if needed
     * @action UPDATE_TABLE
     * @param route - route that has a model that contains a request property
     * @param table - the table metadata model
     */
    [RequestActions.WILL_UPDATE_TABLE](this: FiliConsumer, route: Route, table: TableMetadataModel) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;

      const oldDateTimeColumn = request.columns.find((col) => col.field.endsWith('.dateTime'));
      const newDateTimeMetadata = table.timeDimensions.find((timeDim) => timeDim.id === `${table.id}.dateTime`);
      if (oldDateTimeColumn && newDateTimeMetadata) {
        // We know fili grain values are stored locally, so grab them
        const grainValues = newDateTimeMetadata?.getParameter('grain')?.['_localValues'] ?? [];
        const oldGrain = oldDateTimeColumn.parameters.grain;
        // use current grain if valid otherwise lowest grain
        const newGrain = (grainValues.find((param) => param.id === oldGrain) ? oldGrain : grainValues[0].id) as Grain;

        const oldDateTimeFilter = request.filters.find((filter) => filter.field.endsWith('.dateTime'));
        if (oldDateTimeFilter) {
          this.requestActionDispatcher.dispatch(RequestActions.ADD_DIMENSION_FILTER, route, newDateTimeMetadata, {
            grain: oldGrain,
          });
          const justAddedFilter = request.filters.find((filter) => filter.field === `${table.id}.dateTime`);
          assert('The newly added date time filter is found', justAddedFilter);
          this.requestActionDispatcher.dispatch(RequestActions.UPDATE_FILTER, route, justAddedFilter, {
            operator: oldDateTimeFilter.operator,
            values: oldDateTimeFilter.values,
          });
          if (oldGrain !== newGrain) {
            this.expandFilterInterval(route, justAddedFilter, newGrain);
          }
        }
        this.requestActionDispatcher.dispatch(RequestActions.ADD_COLUMN_WITH_PARAMS, route, newDateTimeMetadata, {
          grain: newGrain,
        });
      }
    },
  };
}
