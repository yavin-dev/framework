/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { DashboardActions } from 'navi-dashboards/services/dashboard-action-dispatcher';
import { get, setProperties } from '@ember/object';

export default ActionConsumer.extend({
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
    }
  }
});
