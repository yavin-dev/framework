/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';
import { get, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend({
  /**
   * @property {Service} user
   */
  user: service(),

  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * @method model
   * @param {String} title - Title of newly created report
   * @returns {DS.Model} new copy of report with different title
   */
  model({ title }) {
    // Return new report with new title
    return this.store.createRecord('report', this._saveAsReport(this.modelFor('reports.report'), title));
  },

  /**
   * Method called when report is saved as successfully
   *
   * @private
   * @method _onSaveSuccess
   * @returns {Void}
   */
  _onSaveAsSuccess() {
    // Show success notification
    this.naviNotifications.add({
      title: 'Report saved',
      style: 'success',
      timeout: 'short',
    });
  },

  /**
   * Method called when a failure occurs while saving as the report
   *
   * @private
   * @method _onSaveFailure
   * @returns {Void}
   */
  _onSaveAsFailure() {
    // Show error notification
    this.naviNotifications.add({
      title: 'An error occurred while trying to save the report',
      style: 'danger',
      timeout: 'medium',
    });
  },

  /**
   * OnSuccess: Show notifications, Save the report to a new name. Leave the
   * original report untouched and Transitions to newly created report.
   * OnFailure: Show notification
   *
   * @method afterModel
   * @param report - resolved report model
   * @override
   */
  afterModel(report) {
    // get Old Report
    let oldReport = this.modelFor('reports.report');
    // Save report
    report
      .save()
      .then(() => {
        this._onSaveAsSuccess();
        // Roll back old report to revert any changes applied to original report
        oldReport.rollbackAttributes();
        // Switch to the newly created report
        return this.replaceWith('reports.report.view', get(report, 'id'));
      })
      .catch(() => {
        // Throws falure and sends user back to old report dirty state
        this._onSaveAsFailure();
        this.replaceWith('reports.report.view');
      });
  },

  /**
   * @method _saveAsReport
   * @private
   * @param {DS.Model} report - The report to save As
   * @returns {Object} copy of report
   */
  _saveAsReport(report, title) {
    let author = get(this, 'user').getUser(),
      clonedReportModel = report.clone();

    // Setting the title and author of report
    setProperties(clonedReportModel, {
      title: title.substring(0, 150),
      author,
    });
    return clonedReportModel;
  },
});
