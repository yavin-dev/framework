/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import RequestActionDispatcher, { RequestActions } from '../../services/request-action-dispatcher';
import { TableMetadata } from 'navi-data/models/metadata/table';
import ReportModel from 'navi-core/models/report';

export default class TableConsumer extends ActionConsumer {
  @service
  requestActionDispatcher!: RequestActionDispatcher;

  actions = {
    [RequestActions.UPDATE_TABLE](this: TableConsumer, route: Route, table: TableMetadata) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      request.setTableByMetadata(table);
      this.requestActionDispatcher.dispatch(RequestActions.DID_UPDATE_TABLE, route, table);
    },
  };
}
