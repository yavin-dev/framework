/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { isArray } from '@ember/array';
import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Controller.extend({
  /**
   * @property {Service} compression
   */
  compression: service(),

  /**
   * @property {Service} store
   */
  store: service(),

  /**
   * @property {Service} metadataService
   */
  metadataService: service('bard-metadata'),

  /**
   * @property {String[]} queryParams
   */
  queryParams: ['filters'],

  /**
   * Update Model to have dirty attributes that match the filter query params
   *
   * @method addFiltersFromQueryParams
   */
  async addFiltersFromQueryParams() {
    const dashboard = this.model.dashboard;
    const modelFilters = dashboard.filters;
    const filterQueryParams = this.filters;

    /**
     * We only want to add filters to the model on initial load of the route
     * If the model already has dirty filters, then this was not called from the initial load
     */
    if (isEmpty(filterQueryParams)) {
      return;
    }

    let decompressedFilters = null;
    try {
      decompressedFilters = await this.compression.decompress(filterQueryParams);

      if (!decompressedFilters.hasOwnProperty('filters') || !isArray(decompressedFilters.filters)) {
        throw Error('Compressed filter is not the right format. Please only ');
      }

      this._removeAllFiltersFromDashboard(dashboard);

      await Promise.all(
        decompressedFilters.filters.map(async fil => {
          const newFragmentFields = {
            field: fil.field,
            operator: fil.operator,
            rawValues: fil.values,
            dimension: this.metadataService.getById('dimension', fil.dimension)
          };

          const newFragment = this.store.createFragment('bard-request/fragments/filter', newFragmentFields);

          modelFilters.pushObject(newFragment);
        })
      );
    } catch (e) {
      throw Error(`Error decompressing filter query params: ${filterQueryParams}\nError: ${e}`);
    }
  },

  /**
   * @private
   * @method _removeAllFiltersFromDashboard
   * @param {Object} dashboard
   */
  _removeAllFiltersFromDashboard(dashboard) {
    const filters = dashboard.filters;
    while (filters.get('firstObject')) {
      filters.popObject();
    }
  },

  actions: {
    /**
     * Update query params to match dirty filter attributes of model
     *
     * @method syncQueryParamsWithModel
     */
    async syncQueryParamsWithModel() {
      const model = this.model.dashboard;
      const hasDirtyAttrs = get(model, 'filters').hasDirtyAttributes;
      const filterQueryParams = hasDirtyAttrs
        ? await this.compression.compress({
            filters: get(model, 'filters')
              .toArray()
              .map(fil => fil.serialize())
          })
        : null;

      this.transitionToRoute({ queryParams: { filters: filterQueryParams } });
    }
  }
});
