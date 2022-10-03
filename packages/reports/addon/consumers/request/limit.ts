/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import Route from '@ember/routing/route';
import RequestActionDispatcher, { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import type ReportModel from 'navi-core/models/report';

export default class LimitConsumer extends ActionConsumer {
  @service
  declare requestActionDispatcher: RequestActionDispatcher;

  actions = {
    [RequestActions.UPDATE_LIMIT](this: LimitConsumer, route: Route, limit: string | number | null) {
      const { routeName } = route;
      const { request } = route.modelFor(routeName) as ReportModel;
      let limitNumber = typeof limit === 'string' ? parseInt(limit) : limit;
      //cap at 10k for now
      if (limitNumber !== null && limitNumber > 10_000) {
        limitNumber = 10_000;
      }
      request.limit = !Number.isNaN(limitNumber) ? limitNumber : null;
    },
  };
}
