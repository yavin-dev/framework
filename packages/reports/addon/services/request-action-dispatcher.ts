/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';

export const RequestActions = <const>{
  ADD_COLUMN_WITH_PARAMS: 'addColumnWithParams',
  DID_ADD_COLUMN: 'didAddColumn',
  UPDATE_COLUMN_FRAGMENT_WITH_PARAMS: 'updateColumnFragmentWithParams',
  REMOVE_COLUMN_FRAGMENT: 'removeColumnFragment',
  RENAME_COLUMN_FRAGMENT: 'renameColumnFragment',
  REORDER_COLUMN_FRAGMENT: 'reorderColumnFragment',

  ADD_FILTER: 'addFilter',
  ADD_DIMENSION_FILTER: 'addDimensionFilter',
  ADD_METRIC_FILTER: 'addMetricFilter',
  UPDATE_FILTER: 'updateFilter',
  REMOVE_FILTER: 'removeFilter',

  UPDATE_TABLE: 'updateTable',
  DID_UPDATE_TABLE: 'didUpdateTable',

  UPSERT_SORT: 'upsertSort',
  REMOVE_SORT: 'removeSort',
};

export default class RequestActionDispatcher extends ActionDispatcher {
  get consumers() {
    return [
      ...super.consumers,
      'request/column',
      'request/filter',
      'request/table',
      'request/sort',
      'request/fili',
      'request/constraint'
    ];
  }
}
