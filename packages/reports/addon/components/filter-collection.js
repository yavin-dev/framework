/**
 * Copyright 2019, Yahoo Holdings Inc.
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
import { computed, get, getWithDefault } from '@ember/object';
import { featureFlag } from 'navi-core/helpers/feature-flag';
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
   * @property {Boolean} isCollapsed
   */
  isCollapsed: false,

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
  orderedFilters: computed('request.{filters.[],intervals.[],having.[]}', function() {
    let dateFilters = getWithDefault(this, 'request.intervals', []).map(filter => {
      return {
        type: 'date-time', // Dasherized to match filter-builder component name
        requestFragment: filter,
        required: true
      };
    });

    let dimFilters = getWithDefault(this, 'request.filters', []).map(filter => {
      let dimensionDataType = get(filter, 'dimension.datatype'),
        type = featureFlag('dateDimensionFilter') && dimensionDataType === 'date' ? 'date-dimension' : 'dimension';

      return {
        type,
        requestFragment: filter
      };
    });

    let metricFilters = getWithDefault(this, 'request.having', []).map(filter => {
      return {
        type: 'metric',
        requestFragment: filter
      };
    });

    return [...dateFilters, ...dimFilters, ...metricFilters];
  })
});
