/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed, action } from '@ember/object';
import layout from '../templates/components/report-builder';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { A } from '@ember/array';

@templateLayout(layout)
@tagName('')
export default class ReportBuilderComponent extends Component {
  /**
   * @property {Service} metadataService
   */
  @service('navi-metadata') metadataService;

  /**
   * @property {Object} request
   */
  @readOnly('report.request') request;

  /**
   * @property {boolean} -- whether report has valid table
   */
  get hasValidLogicalTable() {
    return !!this.request.tableMetadata;
  }

  /**
   * @property {Array} allTables - All metadata table records
   */
  @computed
  get allTables() {
    const factTables = this.metadataService.all('table').filter((t) => t.isFact === true);
    return A(factTables).sortBy('name');
  }

  /**
   * @method _expandFilters
   * @param {Function} shouldExpand
   * @private
   */
  _expandFilters(shouldExpand) {
    const { isFiltersCollapsed, onUpdateFiltersCollapsed } = this;

    if (isFiltersCollapsed && typeof onUpdateFiltersCollapsed === 'function' && shouldExpand()) {
      onUpdateFiltersCollapsed(false);
    }
  }

  /**
   * Stores element reference
   * @param element - element inserted
   */
  @action
  setupElement(element) {
    this.componentElement = element;
  }

  /**
   * @action onAddFilter
   */
  @action
  onAddFilter() {
    this._expandFilters(() => true);
  }
}
