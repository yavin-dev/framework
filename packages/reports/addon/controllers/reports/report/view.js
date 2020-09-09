/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { computed } from '@ember/object';
import { isEqual, omit } from 'lodash-es';
import Controller, { inject as controller } from '@ember/controller';

/**
 * @param {Object} request
 * @returns {Array} canonicalized metrics sorted alphabetically
 */
const sortedColumns = request => [...new Set(request.columns.map(c => c.canonicalName))].sort();

export default class ReportViewController extends Controller {
  /*
   * @property {Controller} reportController
   */
  @controller('reports.report') reportController;

  /*
   * @property {Boolean} hasRequestRun
   */
  @computed('reportController.modifiedRequest', 'model.request')
  get hasRequestRun() {
    const { modifiedRequest } = this.reportController;
    const { request } = this.model;

    if (!modifiedRequest) {
      //no changes have been made yet
      return true;
    }

    if (!isEqual(sortedColumns(request), sortedColumns(modifiedRequest))) {
      //changes in metrics outside of order
      return false;
    }

    if (!isEqual(omit(request, 'columns'), omit(modifiedRequest, 'columns'))) {
      //changes in request outside of metrics
      return false;
    }

    //no changes with the exception of order of metrics
    return true;
  }
}
