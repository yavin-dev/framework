/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import RequestActionDispatcher, { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEqual } from 'lodash-es';
import Route from '@ember/routing/route';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import ReportModel from 'navi-core/models/report';
import { SortDirection } from 'navi-data/adapters/facts/interface';
import { ColumnMetadataModels } from 'navi-core/addon/models/bard-request-v2/fragments/base';

export default class SortConsumer extends ActionConsumer {
  @service requestActionDispatcher!: RequestActionDispatcher;

  actions = {
    /**
     * @action UPSERT_SORT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - The column fragment to update sort for
     * @param direction - the direction of the new sort
     */
    [RequestActions.UPSERT_SORT](
      this: SortConsumer,
      route: Route,
      columnFragment: ColumnFragment,
      direction: SortDirection
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const sorts = request.sorts.filter(sort => sort.canonicalName === columnFragment.canonicalName);

      if (sorts.length >= 1) {
        sorts.forEach(sort => set(sort, 'direction', direction));
      } else {
        request.addSort({
          type: columnFragment.type,
          field: columnFragment.field,
          parameters: columnFragment.parameters,
          source: columnFragment.source,
          direction
        });
      }
    },

    /**
     * @action REMOVE_SORT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - The column fragment to update sort for
     */
    [RequestActions.REMOVE_SORT](this: SortConsumer, route: Route, columnFragment: ColumnFragment) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const sorts = request.sorts.filter(sort => sort.canonicalName === columnFragment.canonicalName);

      sorts.forEach(sort => request.removeSort(sort));
    },

    /**
     * @action REMOVE_COLUMN
     * @param route - route that has a model that contains a request property
     * @param columnMetadata - metadata model of column to remove
     */
    [RequestActions.REMOVE_COLUMN](this: SortConsumer, route: Route, columnMetadata: ColumnMetadataModels) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const sorts = request.sorts.filter(sort => sort.columnMetadata === columnMetadata);

      // Find and remove any `sorts` for the given column metadata
      sorts.forEach(sort => {
        this.requestActionDispatcher.dispatch(RequestActions.REMOVE_SORT, route, sort);
      });
    },

    /**
     * @action REMOVE_COLUMN_WITH_PARAMS
     * @param route - route that has a model that contains a request property
     * @param columnMetadata - metadata model of column to remove
     * @param parameters - metric parameters
     */
    [RequestActions.REMOVE_COLUMN_WITH_PARAMS](
      this: SortConsumer,
      route: Route,
      columnMetadata: ColumnMetadataModels,
      parameters: ColumnFragment['parameters']
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const sorts = request.sorts.filter(
        sort => sort.columnMetadata === columnMetadata && isEqual(parameters, sort.parameters)
      );

      // Find and remove any `sorts` for the given column metadata and parameters
      sorts.forEach(sort => {
        this.requestActionDispatcher.dispatch(RequestActions.REMOVE_SORT, route, sort);
      });
    },

    /**
     * @action REMOVE_COLUMN_FRAGMENT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - the fragment of the column to remove sort
     */
    [RequestActions.REMOVE_COLUMN_FRAGMENT](this: SortConsumer, route: Route, columnFragment: ColumnFragment) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const { columnMetadata, parameters } = columnFragment;
      const sorts = request.sorts.filter(
        sort => sort.columnMetadata === columnMetadata && isEqual(parameters, sort.parameters)
      );

      // Find and remove any `sorts` attached to the metric and parameters
      sorts.forEach(sort => {
        this.requestActionDispatcher.dispatch(RequestActions.REMOVE_SORT, route, sort);
      });
    },

    /**
     * Remove all metric sorts of same base metric if a param is updated
     * @action UPDATE_COLUMN_FRAGMENT_WITH_PARAMS
     * @param route - route that has a model that contains a request property
     * @param columnFragment - the fragment of the column to remove sort
     */
    [RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS](
      this: SortConsumer,
      route: Route,
      columnFragment: ColumnFragment
    ) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const { columnMetadata, parameters } = columnFragment;
      const sorts = request.sorts.filter(
        sort => sort.columnMetadata === columnMetadata && isEqual(parameters, sort.parameters)
      );

      // Find and remove any `sorts` attached to the metric and parameters
      sorts.forEach(sort => {
        this.requestActionDispatcher.dispatch(RequestActions.REMOVE_SORT, route, sort);
      });
    }
  };
}
