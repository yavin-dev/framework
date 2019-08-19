/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import isEqual from 'lodash/isEqual';
import { get, setProperties } from '@ember/object';

export default Controller.extend({
  /**
   * @property {Service} compression
   */
  compression: service(),

  /**
   * @property {Service} metadataService
   */
  metadataService: service('bard-metadata'),

  /**
   * @property {Service} store
   */
  store: service(),

  /**
   * @property {String[]} queryParams
   */
  queryParams: ['filters'],

  /**
   * @property {String} filters query param holding encoded filters for the dashboard
   */
  filters: null,

  actions: {
    /**
     * @action updateFilter
     * @param {Object} dashboard
     * @param {Object} originalFilter
     * @param {Object} changeSet
     */
    async updateFilter(dashboard, originalFilter, changeSet) {
      const origFilter = originalFilter.serialize();
      const newFilters = get(dashboard, 'filters')
        .toArray()
        .map(fil => fil.serialize()); //Native array of serialized filters
      const filterToUpdate = newFilters.find(fil => isEqual(fil, origFilter));

      setProperties(filterToUpdate, changeSet);

      const newFilter = get(this, 'store')
        .createFragment('bard-request/fragments/filter', {
          dimension: get(this, 'metadataService').getById('dimension', filterToUpdate.dimension),
          operator: filterToUpdate.operator,
          field: filterToUpdate.field,
          rawValues: filterToUpdate.rawValues || filterToUpdate.values
        })
        .serialize();

      const index = newFilters.indexOf(filterToUpdate);
      newFilters[index] = newFilter;

      const filterQueryParams = await get(this, 'compression').compress({ filters: newFilters });

      this.transitionToRoute('dashboards.dashboard', { queryParams: { filters: filterQueryParams } });
    },

    /**
     * @action removeFilter
     * @param {Object} dashboard
     * @param {Object} filter
     */
    async removeFilter(dashboard, filter) {
      const filters = get(dashboard, 'filters').serialize();
      const removedFilter = filter.serialize();
      const newFilters = filters.filter(fil => !isEqual(fil, removedFilter));
      const filterQueryParams = await get(this, 'compression').compress({ filters: newFilters });

      this.transitionToRoute('dashboards.dashboard', { queryParams: { filters: filterQueryParams } });
    },

    /**
     * @action addFilter
     * @param {Object} dashboard
     * @param {Object} dimension
     */
    async addFilter(dashboard, dimension) {
      const store = get(this, 'store');
      const bardMetadata = get(this, 'metadataService');
      const filters = get(dashboard, 'filters')
        .toArray()
        .map(fil => fil.serialize()); //Native array of serialized filters
      const filter = store
        .createFragment('bard-request/fragments/filter', {
          dimension: bardMetadata.getById('dimension', dimension.dimension),
          operator: 'in'
        })
        .serialize();

      filters.push(filter);

      const filterQueryParams = await get(this, 'compression').compress({ filters });

      this.transitionToRoute('dashboards.dashboard', { queryParams: { filters: filterQueryParams } });
    },

    /**
     * @action clearFilterQueryParams - Remove query params as model enters clean state
     */
    clearFilterQueryParams() {
      this.set('filters', null);
    }
  }
});
