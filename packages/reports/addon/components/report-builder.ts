/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { sortBy } from 'lodash-es';
//@ts-ignore
import fade from 'ember-animated/transitions/fade';
import type ScreenService from 'navi-core/services/screen';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type ReportModel from 'navi-core/models/report';
import type RequestFragment from 'navi-core/models/request';

interface Args {
  report: ReportModel;
  disabled: boolean;
  isFiltersCollapsed: boolean;
  onUpdateFiltersCollapsed?: (isFiltersCollapsed: boolean) => void;
}

export default class ReportBuilderComponent extends Component<Args> {
  @service('navi-metadata')
  declare metadataService: NaviMetadataService;

  @service
  declare screen: ScreenService;

  @tracked componentElement!: HTMLElement;

  @tracked isSidebarOpen = true;

  constructor(owner: unknown, args: Args) {
    super(owner, args);
    // If existing report on mobile, hide sidebar
    if (!args.report.isNew && this.screen.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  get request(): RequestFragment {
    return this.args.report.request;
  }

  /**
   * whether report has valid table
   */
  get hasValidLogicalTable(): boolean {
    return !!this.request.tableMetadata;
  }

  /**
   * All fact table records
   */
  get allTables() {
    const factTables = this.metadataService.all('table').filter((t) => t.isFact === true);
    return sortBy(factTables, [(table) => table.name.toLowerCase()]);
  }

  @action
  setupElement(element: HTMLElement) {
    this.componentElement = element;
  }

  @action
  doResizeVisualization() {
    const visualizationElement = this.componentElement.querySelector('.report-view');
    if (visualizationElement) {
      const visualizationResizeEvent = new Event('resizestop');
      visualizationElement.dispatchEvent(visualizationResizeEvent);
    }
  }

  @action
  resizeVisualization() {
    scheduleOnce('afterRender', this, 'doResizeVisualization');
  }

  fadeTransition = fade;
}
