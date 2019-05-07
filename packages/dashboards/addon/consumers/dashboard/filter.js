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
      let changeSetUpdates = {};

      //If the interval is set in a dimension filter (rather than datetime filter), set values instead of the interval property
      if (get(changeSet, 'interval')) {
        let intervalAsStrings = get(changeSet, 'interval').asStrings('YYYY-MM-DD');
        changeSetUpdates = { values: [`${intervalAsStrings.start}/${intervalAsStrings.end}`] };
        delete changeSet.interval;
      }
      setProperties(originalFilter, Object.assign({}, changeSet, changeSetUpdates));
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
