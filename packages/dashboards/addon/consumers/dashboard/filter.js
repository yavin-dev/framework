/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { DashboardActions } from 'navi-dashboards/services/dashboard-action-dispatcher';
import { get, setProperties } from '@ember/object';
import { inject } from '@ember/service';

export default ActionConsumer.extend({
  store: inject(),
  bardMetadata: inject(),

  actions: {
    /**
     * @action UPDATE_FILTER
     * @param {Object} originalFilter - object to update
     * @param {Object} changeSet - object of properties and new values
     */
    [DashboardActions.UPDATE_FILTER]: (originalFilter, changeSet) => {
      setProperties(originalFilter, changeSet);
    },

    /**
     * @action REMOVE_FILTER
     * @param {Object} dashboard - model that has filters
     * @param {Object} filter - object to remove from model
     */
    [DashboardActions.REMOVE_FILTER]: (dashboard, filter) => {
      get(dashboard, 'filters').removeObject(filter);
    },

    /**
     * @action ADD_FILTER
     * @param {Object} dashboard - model with filters
     * @param {Object} dimension - new filter dimension
     */
    [DashboardActions.ADD_FILTER]: function(dashboard, dimension) {
      const store = get(this, 'store');
      const bardMetadata = get(this, 'bardMetadata');

      const filter = store.createFragment('bard-request/fragments/filter', {
        dimension: bardMetadata.getById('dimension', dimension.dimension),
        operator: 'in'
      });

      get(dashboard, 'filters').pushObject(filter);
    }
  }
});
