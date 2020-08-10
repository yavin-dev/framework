/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <DimensionBulkImport
 *      @dimension={{@dimensionToImport}}
 *      @queryIds={{@queryIds}}
 *      @rawQuery={{@rawQuery}}
 *      @onSelectValues={{this.selectValues}}
 *      @onCancel={{this.cancel}}
 *   />
 */
import { not } from '@ember/object/computed';
import Component from '@ember/component';
import { get, set, computed, action } from '@ember/object';
import { A as arr } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import layout from '../templates/components/dimension-bulk-import';
import DS from 'ember-data';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class DimensionBulkImportComponent extends Component {
  /**
   * @property {Object} - dimension - dimension metadata containing id and name properties
   */
  dimension = undefined;

  /**
   * @private
   * @property {Array} _trimmedQueryIds - unique list of non-empty dimension ids to search for
   */
  @computed('queryIds')
  get _trimmedQueryIds() {
    const queryIds = get(this, 'queryIds') || [];

    //Remove preceding and trailing white spaces, empty strings and duplicates
    return arr(queryIds.map(key => key.trim()).filter(Boolean)).uniq();
  }

  /**
   * @private
   * @property {Promise} _loadingPromise - loading spinner promise
   */
  _loadingPromise = undefined;

  /**
   * @private
   * @property {Array} _validDimValues - Array of DS.Model Dimension Value Records
   */
  _validDimValues = undefined;

  /**
   * @private
   * @property {Object} _validRawInputDimValue - the single value array with the dim value for raw input
   */
  _validRawInputDimValue = undefined;

  /**
   * @private
   * @property {Array} _invalidDimValueIds - array of invalid dimension value Ids
   */
  @computed('_trimmedQueryIds', '_validDimValues')
  get _invalidDimValueIds() {
    const validDimVals = get(this, '_validDimValues');
    return arr(
      get(this, '_trimmedQueryIds').reject(queryId =>
        validDimVals.any(validDimVal => get(validDimVal, 'id') === queryId)
      )
    );
  }

  /**
   * @private
   * @property {Boolean} _disableButton - if true button is disabled else not
   */
  @not('_loadingPromise.isSettled') _disableButton;

  /**
   * @private
   * @property {Ember.Service} dimensionService
   */
  @service('bard-dimensions') _dimensionService;

  /**
   * @private
   * @property {Ember.Service} - navi metadata
   */
  @service('navi-metadata') naviMetadata;

  /**
   * @method didInsertElement
   * @override
   */
  didInsertElement() {
    super.didInsertElement(...arguments);
    this._search();
  }

  /**
   * Queries dimension service for the given list of dimension value IDs
   *
   * @method search
   * @returns {Void}
   */
  _search() {
    // Nothing to search for
    if (isEmpty(get(this, '_trimmedQueryIds'))) {
      this.onCancel();
      return;
    }

    const splitValuesPromise = get(this, '_dimensionService')
      .find(
        this.dimension?.id,
        [
          {
            values: get(this, '_trimmedQueryIds'),
            field: get(this, 'searchableIdField')
          }
        ],
        { dataSourceName: this.dimension?.source }
      )
      .then(dimValues => {
        set(this, '_validDimValues', dimValues.toArray());
      });

    set(this, '_validRawInputDimValue', undefined);
    const rawInputPromise = get(this, '_dimensionService')
      .find(
        this.dimension?.id,
        [
          {
            field: get(this, 'searchableIdField'),
            values: [this.rawQuery]
          }
        ],
        { dataSourceName: this.dimension?.source }
      )
      .then(dimValue => set(this, '_validRawInputDimValue', dimValue.toArray()));

    //set loading promise
    set(
      this,
      '_loadingPromise',
      DS.PromiseObject.create({
        promise: Promise.all([splitValuesPromise, rawInputPromise])
      })
    );
  }

  /**
   * @property {String} - which id field that we would want to search values against
   */
  @computed('dimension.{id,source}')
  get searchableIdField() {
    const meta = this.naviMetadata.getById('dimension', this.dimension?.id, this.dimension?.source);
    return get(meta, 'idFieldName');
  }

  /**
   * Action to trigger on removing pill
   *
   * @method removeRecord
   * @param {DS.Record} record - record to be removed from valid results
   * @returns {Void}
   */
  @action
  removeRecord(record) {
    return this._validDimValues.removeObject(record);
  }
}

export default DimensionBulkImportComponent;
