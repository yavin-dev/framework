/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <DashboardFilters
 *     @dashboard={{dashboard}}
 *     @onUpdateFilter={{action onUpdateFilter}}
 *     @onRemoveFilter={{action onRemoveFilter}}
 *     @onAddFilter={{action onAddFilter}}
 *   />
 */
import Component from '@ember/component';
import layout from '../templates/components/dashboard-filters';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  classNames: ['dashboard-filters'],
  classNameBindings: ['isCollapsed:dashboard-filters--collapsed:dashboard-filters--expanded'],

  store: service(),

  /**
   * @property {Boolean} isCollapsed
   */
  isCollapsed: true,

  /**
   * @property {Boolean} isAddingMode
   */
  isAddingMode: false,

  /**
   * @property {Object} filters
   */
  request: computed('dashboard.filters.[]', function() {
    return this.store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [],
      filters: this.dashboard.filters.map(filter => {
        const newFilter = this.store.createFragment('bard-request-v2/fragments/filter', {
          field: filter.field,
          parameters: filter.parameters,
          type: filter.type,
          operator: filter.operator,
          values: filter.values,
          source: filter.source
        });
        return newFilter;
      }),
      sorts: [],
      limit: null,
      dataSource: null,
      requestVersion: '2.0'
    });
  })
});
