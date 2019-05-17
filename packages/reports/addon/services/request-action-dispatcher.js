/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';
import { computed } from '@ember/object';

export const RequestActions = {
  ADD_DIMENSION: 'addDimension',
  ADD_DIM_FILTER: 'addDimFilter',
  ADD_METRIC: 'addMetric',
  ADD_METRIC_WITH_PARAM: 'addMetricWithParam',
  ADD_METRIC_FILTER: 'addMetricFilter',
  ADD_TIME_GRAIN: 'addTimeGrain',

  DID_UPDATE_TIME_GRAIN: 'didUpdateTimeGrain',

  REMOVE_DIMENSION: 'removeDimension',
  REMOVE_METRIC: 'removeMetric',
  REMOVE_METRIC_WITH_PARAM: 'removeMetricWithParam',
  REMOVE_TIME_GRAIN: 'removeTimeGrain',
  REMOVE_FILTER: 'removeFilter',
  REMOVE_SORT: 'removeSort',
  REMOVE_SORT_BY_METRIC_MODEL: 'removeSortByMetricModel',
  REMOVE_SORT_WITH_PARAM: 'removeSortWithParam',

  TOGGLE_DIM_FILTER: 'toggleDimensionFilter',
  TOGGLE_METRIC_FILTER: 'toggleMetricFilter',
  TOGGLE_PARAMETERIZED_METRIC_FILTER: 'toggleParameterizedMetricFilter',

  UPDATE_FILTER: 'updateFilter',
  UPDATE_FILTER_PARAM: 'updateFilterParam',
  UPDATE_TABLE: 'updateTable',
  UPSERT_SORT: 'upsertSort'
};

export default ActionDispatcher.extend({
  /**
   * @property {Array} concatenatedProperties
   */
  concatenatedProperties: ['consumers'],

  consumers: computed(() => [
    'request/dimension',
    'request/filter',
    'request/logical-table',
    'request/metric',
    'request/time-grain',
    'request/sort'
  ])
});
