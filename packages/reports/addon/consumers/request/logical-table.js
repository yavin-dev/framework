/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: service(),

  actions: {
    /**
     * @action UPDATE_TABLE
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} table - metadata table model
     */
    [RequestActions.UPDATE_TABLE](route, table) {
      let currentModel = route.currentModel,
        oldTimeGrain = currentModel.request.logicalTable.timeGrain || '';
      set(currentModel, 'request.logicalTable.table', table);
      set(currentModel, 'request.dataSource', table.source);

      /*
       * Since timeGrain is tied to logicalTable, send a timeGrain update
       * and try to find a new time grain with the same name as the previous
       */
      let newTimeGrain = table.timeGrains.find(grain => grain.id === oldTimeGrain) || table.timeGrains[0];
      this.requestActionDispatcher.dispatch(RequestActions.ADD_TIME_GRAIN, route, newTimeGrain);
      this.requestActionDispatcher.dispatch(RequestActions.DID_UPDATE_TABLE, route, table);
    }
  }
});
