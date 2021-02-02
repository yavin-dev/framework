/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { action, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import fade from 'ember-animated/transitions/fade';

const REPORT_STATE = {
  RUNNING: 'running',
  EDITING: 'editing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export default class ReportsReportController extends Controller {
  @service screen;
  /**
   * @property {Boolean} showSaveAs - whether the save as dialog is showing
   */
  showSaveAs = false;

  /**
   * @property {Boolean} isFiltersCollapsed
   */
  isFiltersCollapsed;

  /**
   * @property {Boolean} isColumnDrawerOpen - Display column config or not
   */
  isColumnDrawerOpen;

  /**
   * @property {Object} modifiedRequest - the serialized request after calling `onUpdateReport`
   */
  modifiedRequest = null;

  /**
   * @property {Object} lastAddedColumn - the column that has been added last
   */
  lastAddedColumn = null;

  init() {
    super.init(...arguments);
    const { isMobile } = this.screen;
    set(this, 'isColumnDrawerOpen', !isMobile);
    set(this, 'isFiltersCollapsed', isMobile);
  }

  /**
   * @property {String} reportState - state of the the report
   */
  get reportState() {
    return this._reportState;
  }

  set reportState(value) {
    const states = Object.values(REPORT_STATE);
    assert(`Invalid reportState: \`${value}\`. Must be one of the following: ${states}`, states.includes(value));
    this._reportState = value;
  }

  /**
   * @property {Boolean} isEditingReport - is the report being edited
   */
  @computed('reportState')
  get isEditingReport() {
    return this.reportState === REPORT_STATE.EDITING;
  }

  /**
   * @property {Boolean} isRunningReport - is the report running
   */
  @computed('reportState')
  get isRunningReport() {
    return this.reportState === REPORT_STATE.RUNNING;
  }

  /**
   * @property {Boolean} didReportComplete - did the report complete successfully
   */
  @computed('reportState')
  get didReportComplete() {
    return this.reportState === REPORT_STATE.COMPLETED;
  }

  /**
   * @property {Boolean} didReportFail - did the report fail when running
   */
  @computed('reportState')
  get didReportFail() {
    return this.reportState === REPORT_STATE.FAILED;
  }

  /**
   * Closes save as modal
   */
  @action
  closeSaveAs() {
    set(this, 'showSaveAs', false);
  }

  /**
   * Opens or closes the column config as well as configures a listener to resize the visualization
   * @param {Boolean} isOpen
   * @param {ReportBuilderComponent} reportBuilder - The report builder component containing the visualization
   */
  @action
  updateColumnDrawerOpen(isOpen, reportBuilder) {
    const { isColumnDrawerOpen } = this;
    set(this, 'isColumnDrawerOpen', isOpen);

    if (!isOpen) {
      set(this, 'lastAddedColumn', null);
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
   * @param {Object} column - the last added request column fragment
   */
  @action
  setLastAddedColumn(column) {
    set(this, 'lastAddedColumn', column);
  }

  /**
   * Opens the column config drawer and updates the last added column
   * @param {ReportBuilderComponent} reportBuilder - The report builder component
   * @param {String} columnType - the added column type
   * @param {Object} fragment - the added request fragment
   */
  @action
  onBeforeAddItem(reportBuilder, fragment) {
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
