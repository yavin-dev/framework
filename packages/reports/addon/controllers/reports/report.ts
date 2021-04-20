/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
//@ts-ignore
import fade from 'ember-animated/transitions/fade';
import { tracked } from '@glimmer/tracking';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';
import type ScreenService from 'navi-core/services/screen';
import type ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import type ReportBuilderComponent from 'navi-reports/components/report-builder';

const REPORT_STATE = <const>{
  RUNNING: 'running',
  EDITING: 'editing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

type ReportState = typeof REPORT_STATE[keyof typeof REPORT_STATE];

export default class ReportsReportController extends Controller {
  @service declare screen: ScreenService;

  /**
   * Display filter collection in minimal state
   */
  @tracked isFiltersCollapsed = false;

  /**
   * Display column config or not
   */
  @tracked isColumnDrawerOpen = true;

  /**
   * the serialized request after calling `onUpdateReport`
   */
  @tracked modifiedRequest: RequestV2 | null = null;

  /**
   * the column that has been added last
   */
  @tracked lastAddedColumn: ColumnFragment | null = null;

  /**
   * The current state of the report
   */
  @tracked _reportState!: ReportState;

  onFadeEnd: (() => void) | null = null;

  constructor() {
    super(...arguments);
    const { isMobile } = this.screen;
    this.isColumnDrawerOpen = !isMobile;
    this.isFiltersCollapsed = isMobile;
  }

  /**
   * state of the the report
   */
  get reportState(): ReportState {
    return this._reportState;
  }

  set reportState(value: ReportState) {
    const states = Object.values(REPORT_STATE);
    assert(`Invalid reportState: \`${value}\`. Must be one of the following: ${states}`, states.includes(value));
    this._reportState = value;
  }

  /**
   * is the report being edited
   */
  get isEditingReport() {
    return this.reportState === REPORT_STATE.EDITING;
  }

  /**
   * is the report running
   */
  get isRunningReport() {
    return this.reportState === REPORT_STATE.RUNNING;
  }

  /**
   * did the report complete successfully
   */
  get didReportComplete() {
    return this.reportState === REPORT_STATE.COMPLETED;
  }

  /**
   * @property {Boolean} didReportFail - did the report fail when running
   */
  get didReportFail() {
    return this.reportState === REPORT_STATE.FAILED;
  }

  /**
   * Opens or closes the column config as well as configures a listener to resize the visualization
   * @param isOpen
   * @param reportBuilder - The report builder component containing the visualization
   */
  @action
  updateColumnDrawerOpen(isOpen: boolean, reportBuilder: ReportBuilderComponent) {
    const { isColumnDrawerOpen } = this;
    this.isColumnDrawerOpen = isOpen;

    if (!isOpen) {
      this.lastAddedColumn = null;
    }

    if (isOpen !== isColumnDrawerOpen) {
      const visualizationElement = reportBuilder.componentElement.querySelector('.report-view');
      if (visualizationElement) {
        const visualizationResizeEvent = new Event('resizestop');
        this.onFadeEnd = () => visualizationElement.dispatchEvent(visualizationResizeEvent);
      } else {
        this.onFadeEnd = null;
      }
    }
  }

  /**
   * Updates the last added column (mostly here for documentation)
   * @param column - the last added request column fragment
   */
  @action
  setLastAddedColumn(column: ColumnFragment) {
    this.lastAddedColumn = column;
  }

  /**
   * Opens the column config drawer and updates the last added column
   * @param reportBuilder - The report builder component
   * @param fragment - the added request fragment
   */
  @action
  onBeforeAddItem(reportBuilder: ReportBuilderComponent, fragment: ColumnFragment) {
    this.updateColumnDrawerOpen(true, reportBuilder);
    this.setLastAddedColumn(fragment);
  }

  /**
   * A fade transition that will resize the visualization
   */
  @action
  *fadeTransition() {
    yield* fade(...arguments);
    this.onFadeEnd?.();
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'reports.report': ReportsReportController;
  }
}
