/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { action, set, computed } from '@ember/object';
import { assert } from '@ember/debug';
import config from 'ember-get-config';
import fade from 'ember-animated/transitions/fade';

const REPORT_STATE = {
  RUNNING: 'running',
  EDITING: 'editing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export default class ReportsReportController extends Controller {
  /**
   * @property {Boolean} showSaveAs - whether the save as dialog is showing
   */
  showSaveAs = false;

  /**
   * @property {Boolean} isFiltersCollapsed
   */
  isFiltersCollapsed = false;

  /**
   * @property {Boolean} isColumnDrawerOpen - Display column config or not
   */
  isColumnDrawerOpen = config.navi.FEATURES.enableRequestPreview;

  /**
   * @property {Object} modifiedRequest - the serialized request after calling `onUpdateReport`
   */
  modifiedRequest = null;

  /**
   * @property {Object} lastAddedColumn - the column that has been added last
   */
  lastAddedColumn = null;

  /**
   * @property {String} reportState - state of the the report
   */
  get reportState() {
    return this._reportState;
  }

  set reportState(value) {
    const states = Object.values(REPORT_STATE);
    assert(`Invalid reportState: \`${value}\`. Must be one of the following: ${states}`, states.includes(value));
    return (this._reportState = value);
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
      const visualizationElement = reportBuilder.element.querySelector('.report-view');
      if (visualizationElement) {
        const visualizationResizeEvent = new Event('resizestop');
        this.onFadeEnd = () => visualizationElement.dispatchEvent(visualizationResizeEvent);
      } else {
        this.onFadeEnd = null;
      }
    }
  }

  /**
   * Updates the last added column
   * @param {String} type - the added column type
   * @param {Object} fragment - the added request fragment
   */
  @action
  updateLastAddedColumn(type, fragment) {
    set(this, 'lastAddedColumn', !type ? null : { type, name: name === 'dateTime' ? 'dateTime' : fragment.id });
  }

  /**
   * Opens the column config drawer and updates the last added column
   * @param {ReportBuilderComponent} reportBuilder - The report builder component
   * @param {String} columnType - the added column type
   * @param {Object} fragment - the added request fragment
   */
  @action
  onBeforeAddItem(reportBuilder, columnType, fragment) {
    this.updateColumnDrawerOpen(true, reportBuilder);
    this.updateLastAddedColumn(columnType, fragment);
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
