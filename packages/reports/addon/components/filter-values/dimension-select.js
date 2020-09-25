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
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { debounce } from '@ember/runloop';
import { A } from '@ember/array';
import { resolve, Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, set, computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import CARDINALITY_SIZES from 'navi-data/utils/enums/cardinality-sizes';
import layout from '../../templates/components/filter-values/dimension-select';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

const SEARCH_DEBOUNCE_TIME = 200;

@templateLayout(layout)
@tagName('')
export default class DimensionSelectComponent extends Component {
  /**
   * @private
   * @property {Ember.Service} _dimensionService
   */
  @service('bard-dimensions') _dimensionService;

  /**
   * @private
   * @property {Ember.Service} _metadataService
   */
  @service('navi-metadata') _metadataService;

  /**
   * @property {String} dimensionName - name of dimension to be filtered
   */
  @readOnly('filter.field') dimensionName;

  /**
   * @property {String} primaryKey - primary key for this dimension
   */
  @readOnly('filter.columnMetadata.primaryKeyFieldName') primaryKey;

  /**
   * @property {BardDimensionArray} dimensionOptions - list of all dimension values
   */
  @computed('dimensionName', 'filter.columnMetadata.cardinality', 'searchTerm')
  get dimensionOptions() {
    if (this.searchTerm !== undefined) {
      return undefined; // we are searching, so only show search results
    }

    const {
      dimensionName,
      _dimensionService: dimensionService,
      filter: { source, columnMetadata }
    } = this;

    if (dimensionName && columnMetadata?.cardinality === CARDINALITY_SIZES[0]) {
      return dimensionService.all(dimensionName, { dataSourceName: source });
    }

    return undefined;
  }

  /**
   * @property {BardDimensionArray} selectedDimensions - list of currently selected dimension values
   */
  @computed('filter.{values,subject.source}', 'primaryKey', 'dimensionName')
  get selectedDimensions() {
    let dimensionIds = get(this, 'filter.values'),
      dimensionName = get(this, 'dimensionName'),
      primaryKey = get(this, 'primaryKey'),
      dimensionService = get(this, '_dimensionService'),
      source = get(this, 'filter.source');

    // Only fetch dimensions if filter has values
    if (get(dimensionIds, 'length')) {
      return dimensionService.find(
        dimensionName,
        [
          {
            field: primaryKey,
            values: dimensionIds
          }
        ],
        { dataSourceName: source }
      );
    } else {
      return resolve(A());
    }
  }

  /**
   * @property {String} filterValueFieldId - which id field to use as ID display.
   */
  @computed('filter.{field,columnMetadata.idFieldName}')
  get filterValueFieldId() {
    return this.filter.columnMetadata.idFieldName || this.filter.field;
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
      useNewSearchAPI = get(this, 'useNewSearchAPI'),
      dataSourceName = get(this, 'filter.source');

    get(this, '_dimensionService')
      .search(dimension, { term, useNewSearchAPI, dataSourceName })
      .then(resolve, reject);
  }

  /**
   * @action setValues
   * @param {Array} values
   */
  @action
  setValues(values) {
    this.onUpdateFilter({
      values: A(values).mapBy(this.primaryKey)
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
