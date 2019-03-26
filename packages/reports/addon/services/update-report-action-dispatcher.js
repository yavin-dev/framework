/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import RequestActionDispatcher from './request-action-dispatcher';
import { RequestActions } from './request-action-dispatcher';
import { computed } from '@ember/object';

export const UpdateReportActions = Object.assign({}, RequestActions, {
  UPDATE_TABLE_COLUMN_ORDER: 'updateColumnOrder',
  UPDATE_TABLE_COLUMN: 'updateColumn'
});

export default RequestActionDispatcher.extend({
  /**
   * @property {Array} consumers - concatenate consumers in request
   */
  consumers: computed(function() {
    let consumers = this._super(...arguments).slice();
    consumers.push('report/table-visualization');

    return consumers;
  })
});
