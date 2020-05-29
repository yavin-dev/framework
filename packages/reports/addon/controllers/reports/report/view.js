/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { computed } from '@ember/object';
import { isEqual, omit } from 'lodash-es';
import Controller, { inject as controller } from '@ember/controller';
import { canonicalizeMetric } from 'navi-data/utils/metric';

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
    const metricsKeys = request => (request.metrics || []).map(metric => canonicalizeMetric(metric)).sort();

    if (!modifiedRequest) {
      //no changes have been made yet
      return true;
    }

    if (!isEqual(metricsKeys(request), metricsKeys(modifiedRequest))) {
      //changes in metrics outside of order
      return false;
    }

    if (!isEqual(omit(modifiedRequest, 'metrics'), omit(request, 'metrics'))) {
      //changes in request outside of metrics
      return false;
    }

    //no changes with the exception of order of metrics
    return true;
  }
}
