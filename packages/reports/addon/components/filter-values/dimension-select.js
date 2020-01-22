/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::DimensionSelect
 *       @filter={{filter}}
 *       @onUpdateFilter={{action "update"}}
 *   />
 */
import config from 'ember-get-config';
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { debounce } from '@ember/runloop';
import { A } from '@ember/array';
import { resolve, Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, set, computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import layout from '../../templates/components/filter-values/dimension-select';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

const SEARCH_DEBOUNCE_TIME = 200;

const LOAD_CARDINALITY = config.navi.searchThresholds.contains;

@templateLayout(layout)
@tagName('')
class DimensionSelectComponent extends Component {
  /**
   * @private
   * @property {Ember.Service} _dimensionService
   */
  @service('bard-dimensions') _dimensionService;

  /**
   * @private
   * @property {Ember.Service} _metadataService
   */
  @service('bard-metadata') _metadataService;

  /**
   * @property {String} dimensionName - name of dimension to be filtered
   */
  @readOnly('filter.subject.name') dimensionName;

  /**
   * @property {String} primaryKey - primary key for this dimension
   */
  @readOnly('filter.subject.primaryKeyFieldName') primaryKey;

  /**
   * @property {BardDimensionArray} dimensionOptions - list of all dimension values
   */
  @computed('dimensionName', 'searchTerm')
  get dimensionOptions() {
    if (this.searchTerm !== undefined) {
      return undefined; // we are searching, so only show search results
    }

    const dimensionName = get(this, 'dimensionName'),
      dimensionService = get(this, '_dimensionService'),
      metadataService = get(this, '_metadataService');

    if (dimensionName && get(metadataService.getById('dimension', dimensionName), 'cardinality') <= LOAD_CARDINALITY) {
      return dimensionService.all(dimensionName);
    }

    return undefined;
  }

  /**
   * @property {BardDimensionArray} selectedDimensions - list of currently selected dimension values
   */
  @computed('filter.values')
  get selectedDimensions() {
    let dimensionIds = get(this, 'filter.values'),
      dimensionName = get(this, 'dimensionName'),
      primaryKey = get(this, 'primaryKey'),
      dimensionService = get(this, '_dimensionService');

    // Only fetch dimensions if filter has values
    if (get(dimensionIds, 'length')) {
      return dimensionService.find(dimensionName, [
        {
          field: primaryKey,
          values: dimensionIds
        }
      ]);
    } else {
      return resolve(A());
    }
  }

  /**
   * @property {String} filterValueFieldId - which id field to use as ID display.
   */
  @computed('dimensionName', 'filter.field')
  get filterValueFieldId() {
    const { dimensionName } = this,
      metadataService = this._metadataService,
      meta = metadataService.getById('dimension', dimensionName);

    return meta ? meta.idFieldName : this.filter.field;
  }

  /**
   * @property {Boolean} useNewSearchAPI - whether to use /search endpoint instead of /values
   */
  @computed
  get useNewSearchAPI() {
    return featureFlag('newDimensionsSearchAPI');
  }

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
  }

  /**
   * @action setValues
   * @param {Array} values
   */
  @action
  setValues(values) {
    this.onUpdateFilter({
      rawValues: A(values).mapBy(this.primaryKey)
    });
  }

  /**
   * Searches dimension service for the given query
   *
   * @action searchDimensionValues
   * @param {String} searchTerm - Search query
   */
  @action
  searchDimensionValues(searchTerm) {
    let term = searchTerm.trim();
    set(this, 'searchTerm', term);

    if (term) {
      return new Promise((resolve, reject) => {
        return debounce(this, this._performSearch, term, resolve, reject, SEARCH_DEBOUNCE_TIME);
      });
    }
  }
}

export default DimensionSelectComponent;
