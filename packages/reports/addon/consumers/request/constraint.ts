/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import Route from '@ember/routing/route';
import RequestActionDispatcher, { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import TableMetadataModel from 'navi-data//models/metadata/table';
import RequestConstrainer from 'navi-reports/services/request-constrainer';

export default class ConstraintConsumer extends ActionConsumer {
  @service requestActionDispatcher!: RequestActionDispatcher;
  @service requestConstrainer!: RequestConstrainer;

  actions = {
    /**
     * @action DID_UPDATE_TABLE
     * @param route - route that has a model that contains a request property
     * @param table - table that the request is updated with
     */
    [RequestActions.DID_UPDATE_TABLE](this: ConstraintConsumer, route: Route, _table: TableMetadataModel) {
      this.requestConstrainer.constrain(route);
    },
  };
}
