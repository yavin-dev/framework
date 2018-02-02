/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import RequestActionDispatcher from './request-action-dispatcher';
import { RequestActions } from './request-action-dispatcher';

export const ReportActions = Object.assign({} , RequestActions, {
  UPDATE_TABLE_COLUMN_ORDER: 'updateColumnOrder'
});

export default RequestActionDispatcher.extend({
  /**
   * @property {Array} consumers - concatenate consumers in request
   */
  consumers: [
    'report/table-visualization'
  ]
});
