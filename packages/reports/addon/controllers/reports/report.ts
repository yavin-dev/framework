/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { tracked } from '@glimmer/tracking';
import type { RequestV2 } from 'navi-data/adapters/facts/interface';
import type ScreenService from 'navi-core/services/screen';
import type ColumnFragment from 'navi-core/models/request/column';
import type FilterFragment from 'navi-core/models/request/filter';

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
   * the serialized request after calling `onUpdateReport`
   */
  @tracked modifiedRequest: RequestV2 | null = null;

  /**
   * the column that has been added last
   */
  @tracked lastAddedColumn: ColumnFragment | null = null;

  /**
   * the filter that has been added last
   s*/
  @tracked lastAddedFilter: FilterFragment | null = null;

  /**
   * The current state of the report
   */
  @tracked _reportState!: ReportState;

  constructor() {
    super(...arguments);
    const { isMobile } = this.screen;
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
   * Updates the last added column (mostly here for documentation)
   * @param column - the last added request column fragment
   */
  @action
  setLastAddedColumn(column: ColumnFragment | null) {
    this.lastAddedColumn = column;
  }

  /**
   * Updates the last added filter
   * @param filter - the last added request filter fragment
   */
  @action
  setLastAddedFilter(filter: FilterFragment | null) {
    this.lastAddedFilter = filter;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'reports.report': ReportsReportController;
  }
}
