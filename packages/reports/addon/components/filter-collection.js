/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterCollection
 *     @isCollapsed={{isCollapsed}}
 *     @onUpdateCollapsed={{action onUpdateCollapsed}}
 *     @request={{request}}
 *     @onUpdateFilter={{update-report-action 'UPDATE_FILTER'}}
 *     @onRemoveFilter={{update-report-action 'REMOVE_FILTER'}}
 *   />
 */
import layout from '../templates/components/filter-collection';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['filter-collection'],

  /**
   * @property {Array} classNameBindings
   */
  classNameBindings: ['isCollapsed:filter-collection--collapsed'],

  /**
   * @method click - expand filters on click (when collapsed)
   */
  click() {
    const { isCollapsed, onUpdateCollapsed } = this;
    if (isCollapsed && typeof onUpdateCollapsed === 'function') {
      onUpdateCollapsed(false);
    }
  },

  /**
   * @property {Array} orderedFilters - ordered collection of date, metric, and dimension filters from request
   */
  orderedFilters: computed('request.filters.[]', function() {
    const { filters } = this.request;
    const dateFilters = filters
      .filter(f => f.type === 'time-dimension' && f.field === 'dateTime')
      .map(filter => ({
        type: 'date-time', // Dasherized to match filter-builder component name
        requestFragment: filter,
        required: true
      }));

    let dimFilters = filters
      .filter(f => f.type === 'dimension' || (f.type === 'time-dimension' && f.field !== 'dateTime'))
      .map(filter => {
        let dimensionDataType = filter.columnMeta?.valueType?.toLowerCase?.(),
          type = this._dimensionFilterBuilder(dimensionDataType);

        return {
          type,
          requestFragment: filter
        };
      });

    let metricFilters = filters
      .filter(f => f.type === 'metric')
      .map(filter => {
        return {
          type: filter.type,
          requestFragment: filter
        };
      });

    return [...dateFilters, ...dimFilters, ...metricFilters];
  }),

  /**
   * return appropriate dimension filter builder type based on dimension value Type.
   * @param {String} type - dimension meta data value type.
   * @return {String} which dimension filter builder to use
   */
  _dimensionFilterBuilder(type) {
    const dimensionBuilders = {
      date: 'date-dimension',
      number: 'number-dimension',
      default: 'dimension'
    };

    return dimensionBuilders[type] || dimensionBuilders.default;
  }
});
