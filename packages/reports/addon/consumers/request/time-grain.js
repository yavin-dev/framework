/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';

import { set, get } from '@ember/object';
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
     * @param {String} actionType - add or remove timeGrain
     * @param {Object} timeGrain - the new timeGrain
     */
    [RequestActions.ADD_TIME_GRAIN](route, timeGrain) {
      let model = route.currentModel;
      set(model, 'request.logicalTable.timeGrain', timeGrain);

      get(this, 'requestActionDispatcher').dispatch(RequestActions.DID_UPDATE_TIME_GRAIN, route, timeGrain);
    },

    /**
     * @action REMOVE_TIME_GRAIN
     * set time grain to `all`, if table has an `all` time grain, or do nothing,
     * when time grain is unchecked
     *
     * @param {Object} route - route that has a model that contains a request property
     * @param {String} actionType - add or remove timeGrain
     * @param {Object} timeGrain - the new timeGrain
     */
    [RequestActions.REMOVE_TIME_GRAIN](route) {
      let model = route.currentModel,
        allTimeGrain = get(model, 'request.logicalTable.table.timeGrains').filterBy('name', 'all')[0];

      if (allTimeGrain) {
        set(model, 'request.logicalTable.timeGrain', allTimeGrain);
        get(this, 'requestActionDispatcher').dispatch(RequestActions.DID_UPDATE_TIME_GRAIN, route, allTimeGrain);
      }
    }
  }
});
