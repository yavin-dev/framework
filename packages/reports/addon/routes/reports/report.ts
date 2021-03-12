/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { merge } from 'lodash-es';
import { get, set, action } from '@ember/object';
import { assert } from '@ember/debug';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type UserService from 'navi-core/services/user';
import type UpdateReportActionDispatcher from 'navi-reports/services/update-report-action-dispatcher';
import type RequestConstrainer from 'navi-reports/services/request-constrainer';
import type ReportModel from 'navi-core/models/report';
import type NaviVisualizationsService from 'navi-reports/services/navi-visualizations';
import type { ModelFrom, Transition } from 'navi-core/utils/type-utils';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';
import type ReportsReportController from 'navi-reports/controllers/reports/report';
import type DashboardWidget from 'navi-core/models/dashboard-widget';

type ModelParams = { report_id: string } | { widget_id: string };
type ReportModelParams = { report_id: string };
export type WidgetModelParams = { widget_id: string };
export type ReportLike = ReportModel | DashboardWidget;

export default class ReportsReportRoute extends Route {
  @service declare naviNotifications: NaviNotificationsService;

  @service declare user: UserService;

  @service declare naviVisualizations: NaviVisualizationsService;

  @service declare updateReportActionDispatcher: UpdateReportActionDispatcher;

  @service declare requestConstrainer: RequestConstrainer;

  declare controller: ReportsReportController;

  /**
   * visualization type if not specified in report
   */
  get defaultVisualizationType() {
    return this.naviVisualizations.defaultVisualization();
  }

  /**
   * @param params
   * @param params.reportId - persisted id or temp id of report to fetch
   * @returns model for requested report
   */
  model(params: ModelParams): Promise<ReportLike> {
    const { report_id } = params as ReportModelParams;
    return this.user
      .findOrRegister()
      .then(() => this._findByTempId(report_id) || this.store.findRecord('report', report_id))
      .then(this._defaultVisualization.bind(this));
  }

  /**
   * @param report - resolved report model
   * @override
   */
  afterModel(report: ReportModel): Transition | void {
    this.requestConstrainer.constrain(this);

    if (report.get('isNew') && report.request.validations.isInvalid) {
      return this.replaceWith(`${this.routeName}.edit`, report.tempId);
    }

    if (report.request.validations.isInvalid) {
      return this.replaceWith(`${this.routeName}.invalid`, report.tempId || report.id);
    }
  }

  /**
   * @param controller
   * @override
   */
  setupController(controller: ReportsReportController) {
    //@ts-ignore
    super.setupController(...arguments);
    controller.setProperties({
      modifiedRequest: null,
      lastAddedColumn: null,
    });
  }

  /**
   * @private
   * @param id - temp id of local report
   * @returns report with matching temp id
   *
   */
  _findByTempId(id: string | number) {
    return this.store.peekAll('report').find((r) => r.tempId === id);
  }

  /**
   * Sets default visualization if required
   *
   * @private
   * @param report - report model
   * @returns report with update visualization if required
   *
   */
  _defaultVisualization(report: ReportLike): ReportLike {
    if (!report.visualization?.type) {
      set(report, 'visualization', this.store.createFragment(this.defaultVisualizationType, {}));
    }
    return report;
  }

  /**
   * Rolling back dirty attributes on transition
   * @override
   */
  deactivate() {
    const model = this.modelFor(this.routeName) as ModelFrom<this>;
    // https://github.com/emberjs/ember.js/issues/16820
    if (!this.isDestroying && !model.isNew && model.hasDirtyAttributes) {
      this.send('revertChanges', model);
    }
  }

  /**
   * transition to view subroute if runReport is not handled in subroutes
   */
  @action
  runReport(report: ReportLike) {
    return this.transitionTo(`${this.routeName}.view`, report.tempId || report.id);
  }

  /**
   * transition to view subroute since the running is not handled here.
   * @see routes.reports.report.view.actions.forceRun
   */
  @action
  forceRun(report: ReportLike) {
    this.send('runReport', report);
  }

  /**
   * transition to edit subroute
   */
  @action
  cancelReport(report: ReportLike) {
    this.transitionTo(`${this.routeName}.edit`, report.tempId || report.id);
  }

  /**
   * @param request - object to validate
   * @returns promise that resolves or rejects based on validation status
   */
  @action
  validate(report: ReportLike) {
    return report.request.validate().then(({ validations }) => {
      if (get(validations, 'isInvalid')) {
        // Transition to invalid route to show user validation errors
        return this.transitionTo(`${this.routeName}.invalid`, report.tempId || report.id).then(() => RSVP.reject());
      }

      return RSVP.resolve();
    });
  }

  /**
   * @param report - object to rollback
   */
  @action
  revertChanges(report: ReportLike) {
    report.rollbackAttributes();
    this.send('setModifiedRequest', report.request.serialize());
  }

  /**
   * @param report - object to save
   */
  @action
  async saveReport(report: ReportLike) {
    try {
      await report.save();
      this.naviNotifications.add({
        title: 'Report saved',
        style: 'success',
        timeout: 'short',
      });
      // Switch from temp id to permanent id
      this.replaceWith('reports.report.view', report.id);
    } catch (e) {
      this.naviNotifications.add({
        title: 'An error occurred while saving the report',
        style: 'danger',
        timeout: 'medium',
      });
    }
  }

  /**
   * Updates report model's title, unless new title is empty
   * @param title
   */
  @action
  updateTitle(title: string) {
    const report = this.modelFor(this.routeName) as ModelFrom<this>;
    if (!isEmpty(title)) {
      set(report, 'title', title);
    }
  }

  /**
   * @param state
   */
  @action
  setReportState(state: string) {
    const controller = this.controllerFor(this.routeName) as ReportsReportController;
    controller.set('reportState', state);
  }

  /**
   * @param request
   */
  @action
  setModifiedRequest(request: RequestV2) {
    const controller = this.controllerFor(this.routeName) as ReportsReportController;
    controller.set('modifiedRequest', request);
  }

  /**
   * Update visualization metadata in report
   * @param metadataUpdates
   */
  @action
  onUpdateVisualizationConfig(metadataUpdates: Partial<ReportLike['visualization']['metadata']>) {
    const report = this.modelFor(this.routeName) as ModelFrom<this>;
    const metadata = report.visualization?.metadata;

    set(report.visualization, 'metadata', merge({}, metadata, metadataUpdates));
  }

  /**
   * dispatches actions to update the report and updates the modifiedRequest on the controller
   */
  @action
  onUpdateReport(actionType: string, ...args: unknown[]) {
    /*
     * Whenever the request updates, disable the add to dashboard button until the user runs the request
     * This prevents the user from adding an invalid report/visualization to a dashboard
     */
    this.send('setReportState', 'editing');

    /*
     * dispatch action if arguments are passed through
     * TODO validate actionType is a valid report action
     */
    if (actionType) {
      this.updateReportActionDispatcher.dispatch(actionType, this, ...args);
    }

    const report = this.modelFor(this.routeName) as ModelFrom<this>;
    this.send('setModifiedRequest', report.request.serialize());
  }

  /**
   * toggles favorite model
   */
  @action
  toggleFavorite(report: ReportModel) {
    const user = this.user.getUser();
    assert('User is found', user);
    const { isFavorite } = report;
    const updateOperation = isFavorite ? 'removeObject' : 'addObject';
    const rollbackOperation = isFavorite ? 'addObject' : 'removeObject';

    user.favoriteReports[updateOperation](report);
    user.save().catch(() => {
      //manually rollback - fix once ember-data has a way to rollback relationships
      user.favoriteReports[rollbackOperation](report);
      this.naviNotifications.add({
        title: 'An error occurred while updating favorite reports',
        style: 'danger',
        timeout: 'medium',
      });
    });
  }

  @action
  openFilters() {
    set(this.controller, 'isFiltersCollapsed', false);
  }
}
