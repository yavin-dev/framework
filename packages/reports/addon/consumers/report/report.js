/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionConsumer from 'navi-core/consumers/action-consumer';
import { ReportActions } from 'navi-reports/services/report-action-dispatcher';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default ActionConsumer.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * @property {Service} router
   */
  router: service(),

  actions: {
    /**
     * @action DELETE_REPORT
     * @param {Object} report - report that should be deleted
     */
    [ReportActions.DELETE_REPORT](report) {
      let reportName = get(report, 'title');
      report.deleteRecord();

      return report.save().then(() => {
        // Make sure record is cleaned up locally
        report.unloadRecord();

        get(this, 'naviNotifications').add({
          message: `Report "${reportName}" deleted successfully!`,
          type: 'success',
          timeout: 'short'
        });

        get(this, 'router').transitionTo('reports');
      }).catch(() => {
        // Rollback delete action
        report.rollbackAttributes();

        get(this, 'naviNotifications').add({
          message: `OOPS! An error occurred while deleting report "${reportName}"`,
          type: 'danger',
          timeout: 'short'
        });
      });
    }
  }
});
