/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';

import { get } from '@ember/object';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: service(),

  actions: {
    /**
     * @action ADD_DIMENSION
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - dimension model
     */
    [RequestActions.ADD_DIMENSION]({ currentModel }, dimension) {
      get(currentModel, 'request').addRequestDimensionByModel(dimension);
    },

    /**
     * @action REMOVE_DIMENSION
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - dimension model
     */
    [RequestActions.REMOVE_DIMENSION]({ currentModel }, dimension) {
      get(currentModel, 'request').removeRequestDimensionByModel(dimension);
    },

    /**
     * @action DID_UPDATE_TIME_GRAIN
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} timeGrain - newly updated time grain
     */
    [RequestActions.DID_UPDATE_TIME_GRAIN](route, timeGrain) {
      let request = get(route, 'currentModel.request'),
        timeGrainDimensions = get(timeGrain, 'dimensions');

      get(request, 'dimensions')
        .mapBy('dimension')
        .forEach(dimension => {
          if (!timeGrainDimensions.includes(dimension)) {
            get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_DIMENSION, route, dimension);
          }
        });
    }
  }
});
