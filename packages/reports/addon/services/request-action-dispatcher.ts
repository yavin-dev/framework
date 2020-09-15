/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';

export const RequestActions = {
  ADD_COLUMN: 'addColumn',
  ADD_COLUMN_WITH_PARAMS: 'addColumnWithParams',
  ADD_DIMENSION_FILTER: 'addDimensionFilter',
  ADD_METRIC_FILTER: 'addMetricFilter',

  DID_ADD_COLUMN: 'didAddColumn',

  DID_UPDATE_TIME_GRAIN: 'didUpdateTimeGrain',
  DID_UPDATE_TABLE: 'didUpdateTable',

  REMOVE_COLUMN: 'removeColumn',
  REMOVE_COLUMN_WITH_PARAMS: 'removeColumnWithParams',
  REMOVE_COLUMN_FRAGMENT: 'removeColumnFragment',
  RENAME_COLUMN_FRAGMENT: 'renameColumnFragment',
  REORDER_COLUMN_FRAGMENT: 'reorderColumnFragment',
  REMOVE_TIME_GRAIN: 'removeTimeGrain',
  REMOVE_FILTER: 'removeFilter',
  REMOVE_SORT: 'removeSort',
  REMOVE_SORT_BY_COLUMN_META: 'removeSortByColumnMeta',
  REMOVE_SORT_WITH_PARAMS: 'removeSortWithParams',

  TOGGLE_FILTER: 'toggleFilter',
  TOGGLE_DIMENSION_FILTER: 'toggleDimensionFilter',
  TOGGLE_METRIC_FILTER: 'toggleMetricFilter',
  TOGGLE_PARAMETERIZED_METRIC_FILTER: 'toggleParameterizedMetricFilter',

  UPDATE_FILTER: 'updateFilter',
  UPDATE_COLUMN_FRAGMENT_WITH_PARAMS: 'updateColumnFragmentWithParams',
  UPDATE_TABLE: 'updateTable',
  UPSERT_SORT: 'upsertSort'
};

export default class RequestActionDispatcher extends ActionDispatcher {
  get consumers() {
    return [...super.consumers, 'request/column', 'request/filter', 'request/table', 'request/sort'];
  }
}
