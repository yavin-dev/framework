/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';

export const ReportActions = Object.assign({} , {
  DELETE_REPORT: 'deleteReport'
});

export default ActionDispatcher.extend({

  /**
   * @property {Array} consumers
   */
  consumers: [
    'report/report'
  ]
});
