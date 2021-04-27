/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::DimensionSelect
 *       @filter={{filter}}
 *       @onUpdateFilter={{action "update"}}
 *   />
 */
import { featureFlag } from 'navi-core/helpers/feature-flag';
import { A } from '@ember/array';
import { resolve } from 'rsvp';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import Component from '@ember/component';
import { get, set, computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import CARDINALITY_SIZES from 'navi-data/utils/enums/cardinality-sizes';
import layout from '../../templates/components/filter-values/dimension-select';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { sortBy } from 'lodash-es';

const SEARCH_DEBOUNCE_TIME = 200;

function isNumeric(num) {
  return !isNaN(num);
}
function isNumericDimensionArray(arr) {
  return arr.every(d => isNumeric(d.option.value));
}

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
  @service('bard-metadata') _metadataService;

  /**
   * @property {String} dimensionName - name of dimension to be filtered
   */
  @readOnly('filter.subject.id') dimensionName;

  /**
   * @property {String} primaryKey - primary key for this dimension
   */
  @readOnly('filter.subject.primaryKeyFieldName') primaryKey;

  /**
   * @property {BardDimensionArray} dimensionOptions - list of all dimension values
   */
  @computed('dimensionName', 'searchTerm', 'filter.subject.source', 'isSmallCardinality')
  get dimensionOptions() {
    if (this.searchTerm !== undefined) {
      return undefined; // we are searching, so only show search results
    }

    const dimensionName = get(this, 'dimensionName'),
      dimensionService = get(this, '_dimensionService'),
      source = get(this, 'filter.subject.source');

    if (this.isSmallCardinality) {
      return dimensionService.all(dimensionName, { dataSourceName: source });
    }

    return undefined;
  }

  @computed('dimensionName', 'filter.subject.source')
  get isSmallCardinality() {
    const dimensionName = get(this, 'dimensionName'),
      metadataService = get(this, '_metadataService'),
      source = get(this, 'filter.subject.source'),
      loadedDimension = metadataService.getById('dimension', dimensionName, source);
    return dimensionName && loadedDimension?.cardinality === CARDINALITY_SIZES[0];
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
      source = get(this, 'filter.subject.source');

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
  @computed('dimensionName', 'filter.{field,subject.source}')
  get filterValueFieldId() {
    const { dimensionName } = this,
      metadataService = this._metadataService,
      source = get(this, 'filter.subject.source'),
      meta = metadataService.getById('dimension', dimensionName, source);

    return meta ? meta.idFieldName : this.filter.field;
  }

  @action
  sortValues(dimensions) {
    //don't sort if searching on server
    if (!this.isSmallCardinality) {
      return dimensions;
    }
    if (isNumericDimensionArray(dimensions)) {
      return sortBy(dimensions, [d => Number(d.option.value)]);
    }
    console.log('odering by description');
    return sortBy(dimensions, ['option.description']);
  }

  /**
   * @property {Boolean} useNewSearchAPI - whether to use /search endpoint instead of /values
   */
  @computed
  get useNewSearchAPI() {
    return featureFlag('newDimensionsSearchAPI');
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
   * @param {String} searchTerm - Search query
   */
  @(task(function*(this, term) {
    const searchTerm = term.trim();
    set(this, 'searchTerm', searchTerm);
    const dataSourceName = this.filter.subject.source;

    if (searchTerm) {
      yield timeout(SEARCH_DEBOUNCE_TIME);
      return this._dimensionService.search(this.dimensionName, {
        term: searchTerm,
        useNewSearchAPI: this.useNewSearchAPI,
        dataSourceName
      });
    }
    return undefined;
  }).restartable())
  searchDimensionValues;
}
