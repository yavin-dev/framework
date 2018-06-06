/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/dimension-select
 *       filter=filter
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import Ember from 'ember';
import layout from '../../templates/components/filter-values/dimension-select';

const { computed, get } = Ember;

const SEARCH_DEBOUNCE_TIME = 200;

export default Ember.Component.extend({
  layout,

  tagName: '',

  /**
   * @private
   * @property {Ember.Service} _dimensionService
   */
  _dimensionService: Ember.inject.service('bard-dimensions'),

  /**
   * @property {String} dimensionName - name of dimension to be filtered
   */
  dimensionName: computed.readOnly('filter.subject.name'),

  /**
   * @property {BardDimensionArray} dimensionOptions - list of all dimension values
   */
  dimensionOptions: computed('filter.subject', function() {
    let dimensionName = get(this, 'dimensionName'),
        dimensionService = get(this, '_dimensionService');

    return dimensionService.all(dimensionName);
  }),

  /**
   * @property {BardDimensionArray} selectedDimensions - list of currently selected dimension values
   */
  selectedDimensions: computed('filter.values', function() {
    let dimensionIds = get(this, 'filter.values'),
        dimensionName = get(this, 'dimensionName'),
        dimensionService = get(this, '_dimensionService');

    // Only fetch dimensions if filter has values
    if (get(dimensionIds, 'length')) {
      return dimensionService.find(dimensionName, {field: 'id', values: dimensionIds.join(',')});
    } else {
      return Ember.RSVP.resolve(Ember.A());
    }
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
    let dimension = get(this, 'dimensionName');
    get(this, '_dimensionService').search(dimension, { term }).then(resolve, reject);
  },

  actions: {
    /**
     * @action setValues
     * @param {Array} values
     */
    setValues(values) {
      this.attrs.onUpdateFilter({
        rawValues: Ember.A(values).mapBy('id')
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

      if(term) {
        return new Ember.RSVP.Promise((resolve, reject) => {
          return Ember.run.debounce(this, this._performSearch, term, resolve, reject, SEARCH_DEBOUNCE_TIME);
        });
      }
    }
  }
});
