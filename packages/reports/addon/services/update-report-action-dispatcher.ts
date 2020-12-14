/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import RequestActionDispatcher from './request-action-dispatcher';
import { RequestActions } from './request-action-dispatcher';

export const UpdateReportActions = Object.assign({}, RequestActions, {
  UPDATE_TABLE_COLUMN_ORDER: 'updateColumnOrder',
  UPDATE_TABLE_COLUMN: 'updateColumn'
});

export default class UpdateReportActionDispatcher extends RequestActionDispatcher {
  /**
   * @property {Array} consumers - concatenate consumers in request
   */
  get consumers() {
    return [...super.consumers, 'report/table-visualization'];
  }
}
