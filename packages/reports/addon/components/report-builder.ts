/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { sortBy } from 'lodash-es';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type ReportModel from 'navi-core/models/report';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';
import type ColumnMetadataModel from 'navi-data/models/metadata/column';

interface Args {
  report: ReportModel;
  disabled: boolean;
  onBeforeAddItem?: (reportBuilder: ReportBuilderComponent, column: ColumnMetadataModel) => void;
  isFiltersCollapsed: boolean;
  onUpdateFiltersCollapsed?: (isFiltersCollapsed: boolean) => void;
}

export default class ReportBuilderComponent extends Component<Args> {
  @service('navi-metadata')
  declare metadataService: NaviMetadataService;

  @tracked componentElement!: HTMLElement;

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

  /**
   * @param shouldExpand - a function to determine whether the filters should expand
   */
  protected expandFilters(shouldExpand: () => boolean) {
    const { isFiltersCollapsed, onUpdateFiltersCollapsed } = this.args;

    if (isFiltersCollapsed && onUpdateFiltersCollapsed && shouldExpand()) {
      onUpdateFiltersCollapsed(false);
    }
  }

  @action
  setupElement(element: HTMLElement) {
    this.componentElement = element;
  }

  /**
   * Expands filters when a new one is added
   */
  @action
  openFilters() {
    this.expandFilters(() => true);
  }
}
