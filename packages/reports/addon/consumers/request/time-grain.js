/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: service(),

  actions: {
    /**
     * @action ADD_TIME_GRAIN
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} newTimeGrain - the new timeGrain
     */
    [RequestActions.ADD_TIME_GRAIN](route, newTimeGrain) {
      const { request } = route.currentModel;
      const { timeGrain } = request;

      if (timeGrain !== newTimeGrain.id) {
        request.updateTimeGrain(newTimeGrain.id);
        this.requestActionDispatcher.dispatch(RequestActions.DID_UPDATE_TIME_GRAIN, route, newTimeGrain);
      }
    },

    /**
     * @action REMOVE_TIME_GRAIN
     * set time grain to `all`, if table has an `all` time grain, or do nothing,
     * when time grain is unchecked
     *
     * @param {Object} route - route that has a model that contains a request property
     */
    [RequestActions.REMOVE_TIME_GRAIN](route) {
      const { request } = route.currentModel;

      const allTimeGrain = { id: 'all' };

      request.updateTimeGrain(allTimeGrain.id);
      this.requestActionDispatcher.dispatch(RequestActions.DID_UPDATE_TIME_GRAIN, route, allTimeGrain);
    }
  }
});
