/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{dimension-bulk-import
 *      dimension=dimensionToImport - {Object} dimension to import, with name and longName
 *      queryIds=queryIds - {Array} list of id strings
 *      onSelectValues= (action selectValues) - {String} name of action to trigger on select
 *      onCancel= (action cancel) - {String} name of action to trigger on cancel
 *   }}
 */
import Ember from 'ember';
import layout from '../templates/components/dimension-bulk-import';
import DS from 'ember-data';

const { computed, set, get } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of class names to be applied to the component
   */
  classNames: ['dimension-bulk-import'],

  /**
   * @property {Object} - dimension - dimension metadata containing name and longName properties
   */
  dimension: undefined,

  /**
   * @private
   * @property {Array} _trimmedQueryIds - unique list of non-empty dimension ids to search for
   */
  _trimmedQueryIds: computed('queryIds', function() {
    let queryIds = get(this, 'queryIds') || [];

    //Remove preceding and trailing white spaces, empty strings and duplicates
    return Ember.A(queryIds.map(key => key.trim()).filter(Boolean)).uniq();
  }),

  /**
   * @private
   * @property {Promise} _loadingPromise - loading spinner promise
   */
  _loadingPromise: undefined,

  /**
   * @private
   * @property {Array} _validDimValues - Array of DS.Model Dimension Value Records
   */
  _validDimValues: undefined,

  /**
   * @private
   * @property {Array} _invalidDimValueIds - array of invalid dimension value Ids
   */
  _invalidDimValueIds: computed('_trimmedQueryIds', '_validDimValues', function() {
    let validDimVals = get(this, '_validDimValues');
    return Ember.A(
      get(this, '_trimmedQueryIds').reject(queryId =>
        validDimVals.any(validDimVal => get(validDimVal, 'id') === queryId)
      )
    );
  }),

  /**
   * @private
   * @property {Boolean} _disableButton - if true button is disabled else not
   */
  _disableButton: computed.not('_loadingPromise.isSettled'),

  /**
   * @private
   * @property {Ember.Service} dimensionService
   */
  _dimensionService: Ember.inject.service('bard-dimensions'),

  /**
   * @method didInsertElement
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    this._search();
  },

  /**
   * Queries dimension service for the given list of dimension value IDs
   *
   * @method search
   * @returns {Void}
   */
  _search() {
    // Nothing to search for
    if (Ember.isEmpty(get(this, '_trimmedQueryIds'))) {
      this.attrs.onCancel();
      return;
    }

    let promise = get(this, '_dimensionService')
      .find(get(this, 'dimension.name'), {
        values: get(this, '_trimmedQueryIds').join(',')
      })
      .then(dimValues => {
        set(this, '_validDimValues', dimValues.toArray());
      });

    //set loading promise
    set(this, '_loadingPromise', DS.PromiseObject.create({ promise }));
  },

  actions: {
    /**
     * Action to trigger on removing pill
     *
     * @method removeRecord
     * @param {DS.Record} record - record to be removed from valid results
     * @returns {Void}
     */
    removeRecord(record) {
      get(this, '_validDimValues').removeObject(record);
    }
  }
});
