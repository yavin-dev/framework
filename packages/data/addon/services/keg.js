/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that can store and fetch records
 */
import { typeOf } from '@ember/utils';
import { A, makeArray } from '@ember/array';
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { setProperties, set, get } from '@ember/object';

export default Service.extend({
  /**
   * @property {String} identifierField - field name of the id field
   */
  identifierField: 'id',

  /**
   * Initializes the service
   *
   * @method init
   * @returns {undefined}
   */
  init() {
    this._super(...arguments);
    this.reset();
  },

  /**
   * Resets internal data structures
   *
   * @method reset
   * @returns {undefined}
   */
  reset() {
    set(this, 'recordKegs', {});
    set(this, 'idIndexes', {});
  },

  /**
   * resets internal data structure by type
   *
   * @method resetByType
   * @param {String} type - model type to reset
   */
  resetByType(type) {
    let recordKegs = get(this, 'recordKegs'),
      idIndexes = get(this, 'idIndexes');

    idIndexes[type] = {};
    recordKegs[type] = A();

    set(this, 'recordKegs', recordKegs);
    set(this, 'idIndexes', idIndexes);
  },

  /**
   * Pushes a single record into the store
   *
   * @method push
   * @param {String} type- name of the model type
   * @param {Object} rawRecord - object that is passed the type factory
   * @param {Object} [options] - config object
   * @param {String} [options.modelFactory] - name of explicit modelFactory to store
   * @returns {Object} record that was pushed to the keg
   */
  push(type, rawRecord, options) {
    return this.pushMany(type, [rawRecord], options).get('firstObject');
  },

  /**
   * Pushes an array of records into the store
   *
   * @method pushMany
   * @param {String} type - type name of the model type
   * @param {Array} rawRecords - array of objects that are passed the type factory
   * @param {Object} [options] - config object
   * @param {String} [options.modelFactory] - name of explicit modelFactory to store
   * @returns {Array} records that were pushed to the keg
   */
  pushMany(type, rawRecords, options = {}) {
    let factory = this._getFactoryForType(options.modelFactory || type),
      recordKeg = this._getRecordKegForType(type),
      idIndex = this._getIdIndexForType(type),
      identifierField = get(factory, 'identifierField') || get(this, 'identifierField');

    let returnedRecords = A();

    for (let i = 0; i < rawRecords.length; i++) {
      let id = get(rawRecords[i], identifierField),
        existingRecord = this.getById(type, id);

      if (existingRecord) {
        setProperties(existingRecord, rawRecords[i]);
        returnedRecords.pushObject(existingRecord);
      } else {
        let newRecord = factory.create(rawRecords[i]);

        idIndex[id] = newRecord;
        recordKeg.pushObject(newRecord);
        returnedRecords.pushObject(newRecord);
      }
    }
    return returnedRecords;
  },

  /**
   * Fetches a record by its identifier
   *
   * @method getById
   * @param {String} type - type name of the model type
   * @param {String|Number} id - identifier value
   * @returns {Object|undefined} the found record
   */
  getById(type, id) {
    let idIndex = this._getIdIndexForType(type) || {};
    return idIndex[id];
  },

  /**
   * Fetches a record by the provided clause
   *
   * @method getBy
   * @param {String} type - type name of the model type
   * @param {Object|Function} clause
   * @returns {Array} array of found records
   */
  getBy(type, clause) {
    let recordKeg = this._getRecordKegForType(type),
      foundRecords;

    if (typeof clause === 'object') {
      let fields = Object.keys(clause);

      foundRecords = recordKeg;

      fields.forEach(field => {
        foundRecords = A(
          foundRecords.filter(item => {
            let values = makeArray(clause[field]);
            return values.indexOf(item[field]) > -1;
          })
        );
      });
    } else if (typeof clause === 'function') {
      foundRecords = A(recordKeg.filter(clause));
    }
    return foundRecords;
  },

  /**
   * Fetches all records for a type
   *
   * @method getBy
   * @param {String} type - type name of the model type
   * @returns {Array} array of records of the provided type
   */
  all(type) {
    return this._getRecordKegForType(type);
  },

  /**
   * Fetches model factor for a type
   *
   * @private
   * @method _getFactoryForType
   * @param {String} type - type name of the model type
   * @returns {Object} - model factory
   */
  _getFactoryForType(type) {
    if (typeOf(type) === 'string') {
      return getOwner(this).factoryFor(`model:${type}`).class;
    } else {
      return type;
    }
  },

  /**
   * Fetches records keg for a type or creates one
   *
   * @private
   * @method _getRecordKegForType
   * @param {String} type - type name of the model type
   * @returns {Object} - record keg
   */
  _getRecordKegForType(type) {
    let recordKegs = get(this, 'recordKegs');

    recordKegs[type] = recordKegs[type] || A();
    return recordKegs[type];
  },

  /**
   * Fetches id index for a type or creates one
   *
   * @private
   * @method _getIdIndexForType
   * @param {String} type - type name of the model type
   * @returns {Object} - record id index
   */
  _getIdIndexForType(type) {
    let idIndexes = get(this, 'idIndexes');

    idIndexes[type] = idIndexes[type] || {};
    return idIndexes[type];
  }
});
