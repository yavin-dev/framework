/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';

import Route from '@ember/routing/route';
import { setProperties, set, get } from '@ember/object';

export default Route.extend({
  /**
   * @property {Service} user
   */
  user: service(),

  /**
   * @method model
   * @returns {DS.Model} copy of report
   */
  model() {
    let report = this.modelFor('reports.report');

    return this.store.createRecord('report', this._cloneReport(report));
  },

  /**
   * Transitions to newly created report
   *
   * @method afterModel
   * @param report - resolved report model
   * @override
   */
  afterModel(report) {
    return this.replaceWith('reports.report.view', get(report, 'tempId'));
  },

  /**
   * @method _cloneReport
   * @private
   * @param {DS.Model} report - The report to clone
   * @returns {Object} copy of report
   */
  _cloneReport(report) {
    let author = get(this, 'user').getUser(),
      clonedReportModel = report.clone();

    // Over-riding the cloned model to the default responseFormat of csv
    set(clonedReportModel, 'request.responseFormat', 'csv');
    // Making sure the title does not exceed the 150 char limit
    setProperties(clonedReportModel, {
      title: `Copy of ${clonedReportModel.title}`.substring(0, 150),
      author
    });

    return clonedReportModel;
  }
});
