/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { merge } from 'lodash-es';
import { isForbiddenError } from 'ember-ajax/errors';
import { reject } from 'rsvp';
import { taskFor } from 'ember-concurrency-ts';
import { assert } from '@ember/debug';
import type NaviFactsService from 'navi-data/services/navi-facts';
import type { ModelFrom, Transition } from 'navi-core/utils/type-utils';
import type ReportsReportRoute from 'navi-reports/routes/reports/report';
import type { ReportLike } from 'navi-reports/routes/reports/report';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';
import type RequestFragment from 'navi-core/models/request';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';
import type ReportsReportViewController from 'navi-reports/controllers/reports/report/view';
import type YavinVisualizationsService from 'navi-core/services/visualization';

export default class ReportsReportViewRoute extends Route {
  /**
   * instance of navi facts service
   */
  @service('navi-facts') declare facts: NaviFactsService;

  /**
   * instance of navi visualizations service
   */
  @service declare visualization: YavinVisualizationsService;

  /**
   * options for request
   */
  requestOptions = {
    page: 1,
    perPage: 10000,
    clientId: 'customReports',
  };

  /**
   * object containing request to view
   */
  get parentModel() {
    return this.modelFor('reports.report') as ModelFrom<ReportsReportRoute>;
  }

  /**
   * @returns response from fact service
   */
  model() {
    const report = this.parentModel;
    const request = report.request;
    assert('Request is defined for report', request);
    const serializedRequest = request.serialize() as RequestV2;
    const requestOptions = merge({}, this.requestOptions, {
      customHeaders: {
        uiView: `report.spv.${report.id}`,
      },
      dataSourceName: request.dataSource,
    });

    // Wrap the response in a promise object so we can manually handle loading spinners
    return taskFor(this.facts.fetch)
      .perform(serializedRequest, requestOptions)
      .then(async (response) => {
        this._setValidVisualizationType(request, report);
        await this._setValidVisualizationConfig(request, report, response.response);

        return response;
      })
      .catch((response) => {
        if (isForbiddenError(response.rootCause)) {
          this.transitionTo('reports.report.unauthorized', report.id);
        } else {
          return reject(response);
        }
        return undefined;
      });
  }

  /**
   * Makes sure the visualization type is valid for the request
   * If it is not currently valid, a default will be provided
   * @private
   * @param request
   * @param report
   */
  _setValidVisualizationType(request: RequestFragment, report: ReportLike) {
    const { visualization: visualizationService } = this;
    let { visualization } = report;
    const { manifest } = visualization;

    // If the current type is already valid, don't bother setting a new type
    if (manifest.validate(request).isValid !== true) {
      const def = visualizationService.defaultVisualization();
      report.updateVisualization(def.createModel());
    }
  }

  /**
   * Makes sure the visualization config is valid for the request
   * If it is not currently valid, a default will be provided
   * @private
   * @param request
   * @param report
   * @param response
   */
  async _setValidVisualizationConfig(request: RequestFragment, report: ReportLike, response: NaviFactResponse) {
    const { visualization } = report;
    const { manifest } = visualization;

    const newSettings = manifest.dataDidUpdate(report.visualization.metadata, request, response);
    //@ts-ignore
    visualization.metadata = newSettings;
    report.updateVisualization(visualization);
  }

  /**
   * Returns whether the current request has already run
   * @private
   * @returns true if data is stored for the request
   */
  _hasRequestRun(): boolean {
    const controller = this.controllerFor(this.routeName) as ReportsReportViewController;
    return controller.hasRequestRun;
  }

  /**
   * Runs report if it has changed
   *
   * @returns the model refresh transition
   */
  @action
  runReport(): Transition | void {
    // Run the report only if there are request changes
    if (!this._hasRequestRun()) {
      return this.refresh();
    } else {
      this.send('setReportState', 'completed');
    }
  }

  /**
   * Forces the report to be rerun, used when user explicitly pushes run button.
   *
   * @returns refreshes model transition
   */
  @action
  forceRun(): Transition {
    return this.refresh();
  }

  /**
   * Code to run before validating the request
   */
  @action
  beforeValidate() {
    // noop
  }

  @action
  loading(transition: Transition) {
    /**
     * false is sent as the first argument due to a change in router_js
     * TODO: Remove false if this is ever removed
     * https://github.com/emberjs/ember.js/issues/17545
     */
    //@ts-ignore
    transition.send(false, 'setReportState', 'running');
    return true; // allows the loading template to be shown
  }

  /**
   * @action error
   */
  @action
  error(_error: unknown, transition: Transition) {
    /**
     * false is sent as the first argument due to a change in router_js
     * TODO: Remove false if this is ever removed
     * https://github.com/emberjs/ember.js/issues/17545
     */
    //@ts-ignore
    transition.send(false, 'setReportState', 'failed');
    return true; // allows the error template to be shown
  }

  /**
   * @action didTransition
   */
  @action
  didTransition() {
    this.send('setReportState', 'completed');

    return true;
  }
}
