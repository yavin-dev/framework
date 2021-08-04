/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import ActionConsumer from 'navi-core/consumers/action-consumer';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { inject as service } from '@ember/service';

export default ActionConsumer.extend({
  /**
   * @property {Ember.Service} requestActionDispatcher
   */
  requestActionDispatcher: service(),

  actions: {
    /**
     * @action PUSH_ROLLUP_COLUMN
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - metadata model of dimension to add
     */
    [RequestActions.PUSH_ROLLUP_COLUMN]({ currentModel }, dimension) {
      currentModel.request.pushRollupColumn(dimension);
    },

    /**
     * @action REMOVE_ROLLUP_COLUMN
     * @param {Object} route - route that has a model that contains a request property
     * @param {Object} dimension - metadata model of dimension to add
     */
    [RequestActions.REMOVE_ROLLUP_COLUMN]({ currentModel }, dimension) {
      currentModel.request.removeRollupColumn(dimension);
    },

    /**
     * @action UPDATE_GRAND_TOTAL
     * @param {Object} route - route that has a model that contains a request property
     * @param {Boolean} isGrandTotal - whether to enable grand total on the request or not
     */
    [RequestActions.UPDATE_GRAND_TOTAL]({ currentModel }, isGrandTotal) {
      currentModel.request.setGrandTotal(isGrandTotal);
    }
  }
});
