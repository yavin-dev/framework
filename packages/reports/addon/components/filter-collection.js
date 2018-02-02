/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-collection
 *       request=report.request
 *       onUpdateFilter=(report-action 'UPDATE_FILTER')
 *       onRemoveFilter=(report-action 'REMOVE_FILTER')
 *   }}
 */
import Ember from 'ember';
import layout from '../templates/components/filter-collection';

const { computed, get } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['filter-collection'],

  /**
   * @property {Array} orderedFilters - ordered collection of date, metric, and dimension filters from request
   */
  orderedFilters: computed('request.{filters.[],intervals.[],having.[]}', function() {
    let dateFilters = get(this, 'request.intervals').map(filter => {
      return {
        type: 'date-time', // Dasherized to match filter-builder component name
        requestFragment: filter,
        required: true
      };
    });

    let dimFilters = get(this, 'request.filters').map(filter => {
      return {
        type: 'dimension',
        requestFragment: filter
      };
    });

    let metricFilters = get(this, 'request.having').map(filter => {
      return {
        type: 'metric',
        requestFragment: filter
      };
    });

    return [
      ...dateFilters,
      ...dimFilters,
      ...metricFilters
    ];
  })
});
