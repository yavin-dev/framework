/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import RequestActionDispatcher, { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEqual } from 'lodash-es';
import Route from '@ember/routing/route';
import ColumnFragment from 'navi-core/models/request/column';
import ReportModel from 'navi-core/models/report';
import { SortDirection } from 'navi-data/adapters/facts/interface';
import Base, { ColumnMetadataModels } from 'navi-core/models/request/base';
import { ColumnType } from 'navi-data/models/metadata/column';

export default class SortConsumer extends ActionConsumer {
  @service requestActionDispatcher!: RequestActionDispatcher;

  /**
   * Checks if there were duplicates of a removed column before removing the sorts
   * @param route - route that has a model that contains a request property
   * @param columnMetadata - metadata model of column to remove
   * @param parameters - column parameters
   */
  onRemoveColumn(route: Route, columnMetadata: ColumnMetadataModels, parameters?: ColumnFragment['parameters']) {
    const { routeName } = route;
    const { request } = route.modelFor(routeName) as ReportModel;
    const sameBase = (column: Base<ColumnType>) => {
      const sameColumnMetadataModel = column.columnMetadata === columnMetadata;
      if (parameters !== undefined) {
        return sameColumnMetadataModel && isEqual(parameters, column.parameters);
      }
      return sameColumnMetadataModel;
    };
    if (request.columns.filter(sameBase).length > 0) {
      return;
    }

    request.sorts.filter(sameBase).forEach((sort) => {
      this.requestActionDispatcher.dispatch(RequestActions.REMOVE_SORT, route, sort);
    });
  }

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
      if (!columnFragment.columnMetadata.isSortable) {
        return;
      }

      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      const sorts = request.sorts.filter((sort) => sort.canonicalName === columnFragment.canonicalName);

      if (sorts.length >= 1) {
        sorts.forEach((sort) => set(sort, 'direction', direction));
      } else {
        request.addSort({
          type: columnFragment.type,
          field: columnFragment.field,
          parameters: columnFragment.parameters,
          source: columnFragment.source,
          direction,
          cid: columnFragment.cid,
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
      const sorts = request.sorts.filter((sort) => sort.canonicalName === columnFragment.canonicalName);

      sorts.forEach((sort) => request.removeSort(sort));
    },

    /**
     * @action REMOVE_COLUMN_FRAGMENT
     * @param route - route that has a model that contains a request property
     * @param columnFragment - the fragment of the column to remove sort
     */
    [RequestActions.REMOVE_COLUMN_FRAGMENT](this: SortConsumer, route: Route, columnFragment: ColumnFragment) {
      const { columnMetadata, parameters } = columnFragment;
      this.onRemoveColumn(route, columnMetadata, parameters);
    },

    /**
     * Update all column sorts of same base column if a param is updated
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

      // update sorts associated with this column
      const sort = request.sorts.findBy('cid', columnFragment.cid);
      if (sort) {
        sort.type = columnFragment.type;
        sort.field = columnFragment.field;
        sort.parameters = columnFragment.parameters;
        sort.source = columnFragment.source;
      }
    },
  };
}
