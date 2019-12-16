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

export default Component.extend({
  layout,
  classNames: ['dashboard-filters'],
  classNameBindings: ['isCollapsed:dashboard-filters--collapsed:dashboard-filters--expanded'],

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
  filters: computed('dashboard.filters', function() {
    return { filters: this.dashboard.filters };
  })
});
