/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';

export const DashboardActions = {
  REMOVE_FILTER: 'removeFilter',
  UPDATE_FILTER: 'updateFilter'
};

export default ActionDispatcher.extend({
  /**
   * @property {Array} concatenatedProperties
   */
  concatenatedProperties: ['consumers'],

  consumers: ['dashboard/filter']
});
