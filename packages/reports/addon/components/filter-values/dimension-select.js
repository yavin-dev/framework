/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/dimension-select
 *       filter=filter
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import config from 'ember-get-config';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { readOnly } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import { A } from '@ember/array';
import { resolve, Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from '../../templates/components/filter-values/dimension-select';

const SEARCH_DEBOUNCE_TIME = 200;

const LOAD_CARDINALITY = config.navi.searchThresholds.contains;

export default Component.extend({
  layout,

  tagName: '',

  /**
   * @private
   * @property {Ember.Service} _dimensionService
   */
  _dimensionService: service('bard-dimensions'),

  /**
   * @property _metadataService
   */
  _metadataService: service('bard-metadata'),

  /**
   * @property {String} dimensionName - name of dimension to be filtered
   */
  dimensionName: readOnly('filter.subject.name'),

  /**
   * @property {String} primaryKey - primary key for this dimension
   */
  primaryKey: readOnly('filter.subject.primaryKeyFieldName'),

  /**
   * @property {BardDimensionArray} dimensionOptions - list of all dimension values
   */
  dimensionOptions: computed('filter.subject', function() {
    const dimensionName = get(this, 'dimensionName'),
      dimensionService = get(this, '_dimensionService'),
      metadataService = get(this, '_metadataService');

    if (dimensionName && get(metadataService.getById('dimension', dimensionName), 'cardinality') <= LOAD_CARDINALITY) {
      return dimensionService.all(dimensionName);
    }

    return undefined;
  }),

  /**
   * @property {BardDimensionArray} selectedDimensions - list of currently selected dimension values
   */
  selectedDimensions: computed('filter.values', function() {
    let dimensionIds = get(this, 'filter.values'),
      dimensionName = get(this, 'dimensionName'),
      primaryKey = get(this, 'primaryKey'),
      dimensionService = get(this, '_dimensionService');

    // Only fetch dimensions if filter has values
    if (get(dimensionIds, 'length')) {
      return dimensionService.find(dimensionName, {
        field: primaryKey,
        values: dimensionIds.join(',')
      });
    } else {
      return resolve(A());
    }
  }),

  /**
   * @property {String} filterValueFieldId - which id field to use as ID display.
   */
  filterValueFieldId: computed('dimensionName', 'filter.field', function() {
    const { dimensionName } = this,
      metadataService = this._metadataService,
      meta = metadataService.getById('dimension', dimensionName);

    return meta ? meta.idFieldName : this.filter.field;
  }),

  /**
   * @property {Boolean} useNewSearchAPI - whether to use /search endpoint instead of /values
   */
  useNewSearchAPI: computed(function() {
    return featureFlag('newDimensionsSearchAPI');
  }),

  /**
   * Executes a dimension search for a given term and executes the
   * provided callbacks
   *
   * @method _performSearch
   * @private
   * @param {String} term - search term
   * @param {Function} resolve - resolve callback function
   * @param {Function} reject - reject callback function
   * @returns {Void}
   */
  _performSearch(term, resolve, reject) {
    let dimension = get(this, 'dimensionName'),
      useNewSearchAPI = get(this, 'useNewSearchAPI');

    get(this, '_dimensionService')
      .search(dimension, { term, useNewSearchAPI })
      .then(resolve, reject);
  },

  actions: {
    /**
     * @action setValues
     * @param {Array} values
     */
    setValues(values) {
      let primaryKey = get(this, 'primaryKey');
      this.onUpdateFilter({
        rawValues: A(values).mapBy(primaryKey)
      });
    },

    /**
     * Searches dimension service for the given query
     *
     * @action searchDimensionValues
     * @param {String} query - Search query
     */
    searchDimensionValues(query) {
      let term = query.trim();

      if (term) {
        return new Promise((resolve, reject) => {
          return debounce(this, this._performSearch, term, resolve, reject, SEARCH_DEBOUNCE_TIME);
        });
      }
    }
  }
});
