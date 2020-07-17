/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';
import { computed } from '@ember/object';

export const RequestActions = {
  ADD_COLUMN: 'addColumn',
  ADD_COLUMN_WITH_PARAMS: 'addColumnWithParams',
  ADD_DIMENSION_FILTER: 'addDimensionFilter',
  ADD_METRIC_FILTER: 'addMetricFilter',
  ADD_TIME_GRAIN: 'addTimeGrain',

  DID_UPDATE_TIME_GRAIN: 'didUpdateTimeGrain',
  DID_UPDATE_TABLE: 'didUpdateTable',

  REMOVE_COLUMN: 'removeColumn',
  REMOVE_COLUMN_WITH_PARAMS: 'removeColumnWithParams',
  REMOVE_COLUMN_FRAGMENT: 'removeColumnFragment',
  REMOVE_TIME_GRAIN: 'removeTimeGrain',
  REMOVE_FILTER: 'removeFilter',
  REMOVE_SORT: 'removeSort',
  REMOVE_SORT_BY_COLUMN_META: 'removeSortByColumnMeta',
  REMOVE_SORT_WITH_PARAMS: 'removeSortWithParams',

  TOGGLE_DIMENSION_FILTER: 'toggleDimensionFilter',
  TOGGLE_METRIC_FILTER: 'toggleMetricFilter',
  TOGGLE_PARAMETERIZED_METRIC_FILTER: 'toggleParameterizedMetricFilter',

  UPDATE_FILTER: 'updateFilter',
  UPDATE_FILTER_PARAMS: 'updateFilterParams',
  UPDATE_COLUMN_FRAGMENT_WITH_PARAMS: 'updateColumnFragmentWithParams',
  UPDATE_TABLE: 'updateTable',
  UPSERT_SORT: 'upsertSort'
};

export default ActionDispatcher.extend({
  /**
   * @property {Array} concatenatedProperties
   */
  concatenatedProperties: ['consumers'],

  consumers: computed(function() {
    return ['request/column', 'request/filter', 'request/table', 'request/time-grain', 'request/sort'];
  })
});
