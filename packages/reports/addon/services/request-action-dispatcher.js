/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';

export const RequestActions = {
  ADD_DIMENSION: 'addDimension',
  ADD_DIM_FILTER: 'addDimFilter',
  ADD_METRIC: 'addMetric',
  ADD_METRIC_FILTER: 'addMetricFilter',
  ADD_TIME_GRAIN: 'addTimeGrain',

  DID_UPDATE_TIME_GRAIN: 'didUpdateTimeGrain',

  REMOVE_DIMENSION: 'removeDimension',
  REMOVE_METRIC: 'removeMetric',
  REMOVE_TIME_GRAIN: 'removeTimeGrain',
  REMOVE_FILTER: 'removeFilter',
  REMOVE_SORT: 'removeSort',

  TOGGLE_DIM_FILTER: 'toggleDimensionFilter',
  TOGGLE_METRIC_FILTER: 'toggleMetricFilter',

  UPDATE_FILTER: 'updateFilter',
  UPDATE_TABLE: 'updateTable',
  UPSERT_SORT: 'upsertSort'
};

export default ActionDispatcher.extend({
  /**
   * @property {Array} concatenatedProperties
   */
  concatenatedProperties: ['consumers'],

  consumers: [
    'request/dimension',
    'request/filter',
    'request/logical-table',
    'request/metric',
    'request/time-grain',
    'request/sort'
  ]
});
