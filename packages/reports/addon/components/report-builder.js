/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { readOnly } from '@ember/object/computed';
import { A as arr } from '@ember/array';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from '../templates/components/report-builder';
import { canonicalizeMetric } from 'navi-data/utils/metric';

export default Component.extend({
  layout,

  classNames: ['report-builder'],

  /**
   * @property {Service} metadataService
   */
  metadataService: service('bard-metadata'),

  /**
   * @property {Object} request
   */
  request: readOnly('report.request'),

  /**
   * @property {boolean} -- whether report has valid table
   */
  hasValidLogicalTable: computed('report.request.logicalTable.table', function() {
    const allTables = arr(get(this, 'allTables'));
    const tableName = get(this, 'report.request.logicalTable.table.name');
    return allTables.filter(t => t.name === tableName).length > 0;
  }),

  /**
   * @property {Array} allTables - All metadata table records
   */
  allTables: computed(function() {
    let metadataService = get(this, 'metadataService');
    return metadataService.all('table').sortBy('longName');
  }),

  actions: {
    /**
     * @action expandFilters
     * @param {Function} shouldExpand
     */
    expandFilters(shouldExpand) {
      const { isFiltersCollapsed, onUpdateFiltersCollapsed } = this;

      if (isFiltersCollapsed && typeof onUpdateFiltersCollapsed === 'function' && shouldExpand()) {
        onUpdateFiltersCollapsed(false);
      }
    },

    /**
     * @action onToggleDimFilter
     * @param {Object} dimension
     */
    onToggleDimFilter(dimension) {
      this.send('expandFilters', () => arr(this.request.filters).findBy('dimension', dimension));
    },

    /**
     * @action onToggleMetricFilter
     * @param {Object} metric
     */
    onToggleMetricFilter(metric) {
      this.send('expandFilters', () =>
        arr(this.request.having).find(having => get(having, 'metric.metric.name') === get(metric, 'name'))
      );
    },

    /**
     * @action onToggleParameterizedMetricFilter
     * @param {Object} metric
     * @param {Object} parameters
     */
    onToggleParameterizedMetricFilter(metric, parameters) {
      this.send('expandFilters', () =>
        arr(this.request.having).find(
          having =>
            get(having, 'metric.canonicalName') ===
            canonicalizeMetric({
              metric: get(metric, 'name'),
              parameters
            })
        )
      );
    }
  }
});
