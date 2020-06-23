/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { readOnly } from '@ember/object/computed';
import { A as arr } from '@ember/array';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed, action } from '@ember/object';
import layout from '../templates/components/report-builder';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class ReportBuilderComponent extends Component {
  /**
   * @property {Service} metadataService
   */
  @service('bard-metadata') metadataService;

  /**
   * @property {Object} request
   */
  @readOnly('report.request') request;

  /**
   * @property {boolean} -- whether report has valid table
   */
  @computed('report.request.logicalTable.table')
  get hasValidLogicalTable() {
    const allTables = arr(this.allTables);
    const tableName = this.report.request.logicalTable.table?.name;
    return allTables.filter(t => t.name === tableName).length > 0;
  }

  /**
   * @property {Array} allTables - All metadata table records
   */
  @computed
  get allTables() {
    return this.metadataService.all('table').sortBy('name');
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
   * @action onToggleDimFilter
   * @param {Object} dimension
   */
  @action
  onToggleDimFilter(dimension) {
    this._expandFilters(() => arr(this.request.filters).findBy('dimension', dimension));
  }

  /**
   * @action onToggleMetricFilter
   * @param {Object} metric
   */
  @action
  onToggleMetricFilter(metric) {
    this._expandFilters(() => (this.request.having || []).find(having => having.metric.metric.name === metric.name));
  }

  /**
   * @action onToggleParameterizedMetricFilter
   * @param {Object} metric
   * @param {Object} parameters
   */
  @action
  onToggleParameterizedMetricFilter(metric, parameters) {
    this._expandFilters(() =>
      (this.request.having || []).find(
        having => having.metric.canonicalName === canonicalizeMetric({ metric: metric.name, parameters })
      )
    );
  }
}
