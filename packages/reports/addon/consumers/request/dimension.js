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
     * @action REMOVE_DIMENSION_FRAGMENT
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - DS.Fragment of a dimension that should be removed from the request
     */
    [RequestActions.REMOVE_DIMENSION_FRAGMENT]({ currentModel }, dimension) {
      get(currentModel, 'request').removeRequestDimension(dimension);
    },

    /**
     * @action DID_UPDATE_TABLE
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} table - newly updated table
     */
    [RequestActions.DID_UPDATE_TABLE](route, table) {
      let request = get(route, 'currentModel.request'),
        tableDimensions = table.dimensions;

      request.dimensions.mapBy('dimension').forEach(dim => {
        if (!tableDimensions.includes(dim)) {
          get(this, 'requestActionDispatcher').dispatch(RequestActions.REMOVE_DIMENSION, route, dim);
        }
      });
    }
  }
});
