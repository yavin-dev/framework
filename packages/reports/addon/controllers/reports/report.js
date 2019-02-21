/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { get, set, computed } from '@ember/object';
import { assert } from '@ember/debug';

const REPORT_STATE = {
  RUNNING: 'running',
  EDITING: 'editing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export default Controller.extend({
  /**
   * @property {String} reportState - state of the the report
   */
  reportState: computed({
    get() {
      return get(this, '_reportState');
    },
    set(key, value) {
      const states = Object.values(REPORT_STATE);
      assert(`Invalid reportState: \`${value}\`. Must be one of the following: ${states}`, states.includes(value));
      set(this, '_reportState', value);
      return value;
    }
  }),

  /**
   * @property {Boolean} isEditingReport - is the report being edited
   */
  isEditingReport: computed('reportState', function() {
    return get(this, 'reportState') === REPORT_STATE.EDITING;
  }),

  /**
   * @property {Boolean} isRunningReport - is the report running
   */
  isRunningReport: computed('reportState', function() {
    return get(this, 'reportState') === REPORT_STATE.RUNNING;
  }),

  /**
   * @property {Boolean} didReportComplete - did the report complete successfully
   */
  didReportComplete: computed('reportState', function() {
    return get(this, 'reportState') === REPORT_STATE.COMPLETED;
  }),

  /**
   * @property {Boolean} didReportFail - did the report fail when running
   */
  didReportFail: computed('reportState', function() {
    return get(this, 'reportState') === REPORT_STATE.FAILED;
  })
});
