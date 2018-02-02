/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { ReportActions } from 'navi-reports/services/report-action-dispatcher';

const { assign, get, set } = Ember;

export default ActionConsumer.extend({

  actions: {
    /**
     * @action UPDATE_TABLE_COLUMN_ORDER
     * @param {Object} route - report route
     * @param {Object} newColumnOrder - new column order to replace old
     */
    [ReportActions.UPDATE_TABLE_COLUMN_ORDER]({ currentModel:report }, newColumnOrder) {
      Ember.assert('Visualization must be a table', get(report, 'visualization.type') === 'table');
      let metadata = get(report, 'visualization.metadata');
      set(report, 'visualization.metadata',
        assign({}, metadata, { columns: newColumnOrder})
      );
    }
  }
});
