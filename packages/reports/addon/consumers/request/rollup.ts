/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import Route from '@ember/routing/route';
import RequestActionDispatcher, { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import ColumnFragment from 'navi-core/addon/models/bard-request-v2/fragments/column';
import ReportModel from 'navi-core/models/report';

export default class RollupConsumer extends ActionConsumer {
  @service
  declare requestActionDispatcher: RequestActionDispatcher;

  actions = {
    /**
     * @action PUSH_ROLLUP_COLUMN
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     */
    [RequestActions.PUSH_ROLLUP_COLUMN](this: RollupConsumer, route: Route, columnFragment: ColumnFragment) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.pushRollupColumn(columnFragment);
    },

    /**
     * @action REMOVE_ROLLUP_COLUMN
     * @param route - route that has a model that contains a request property
     * @param columnFragment - data model fragment of the column
     */
    [RequestActions.REMOVE_ROLLUP_COLUMN](this: RollupConsumer, route: Route, columnFragment: ColumnFragment) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.removeRollupColumn(columnFragment);
    },

    /**
     * @action UPDATE_GRAND_TOTAL
     * @param route - route that has a model that contains a request property
     * @param isGrandTotal - boolean grand total flag
     */
    [RequestActions.UPDATE_GRAND_TOTAL](this: RollupConsumer, route: Route, isGrandTotal: boolean) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.setGrandTotal(isGrandTotal);
    },
  };
}
