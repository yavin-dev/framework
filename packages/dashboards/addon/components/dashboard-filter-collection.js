/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{dashboard-filter-collection
 *     dashboard=dashboard
 *   }}
 */
import Component from '@ember/component';
import layout from 'navi-reports/templates/components/filter-collection';
import { computed, get } from '@ember/object';
import { featureFlag } from 'navi-core/helpers/feature-flag';

export default Component.extend({
  layout,
  classNames: ['dashboard-filter-collection'],

  /**
   * @property {Array} orderedFilters - ordered collection of date, metric, and dimension filters from request
   */
  orderedFilters: computed('dashboard.filters.[]', function() {
    return get(this, 'dashboard.filters').map(filter => {
      let dimensionDataType = get(filter, 'dimension.datatype'),
        type = featureFlag('dateDimensionFilter') && dimensionDataType === 'date' ? 'date-dimension' : 'dimension';

      return {
        type,
        requestFragment: filter
      };
    });
  })
});
