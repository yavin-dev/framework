/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that can store and fetch records
 */
import { typeOf } from '@ember/utils';
import { A, makeArray } from '@ember/array';
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { setProperties } from '@ember/object';

export default class KegService extends Service {
  /**
   * @property {String} identifierField - field name of the id field
   */
  static identifierField = 'id';

  /**
   * @property {Object} recordKeg - Object of record arrays
   */
  recordKegs = {};

  /**
   * @property {Object} idIndexes - Object of record idexes
   */
  idIndexes = {};

  /**
   * @property {String} defaultNamespace
   */
  defaultNamespace = 'navi';

  /**
   * Resets internal data structures
   *
   * @method reset
   * @returns {undefined}
   */
  reset() {
    this.recordKegs = {};
    this.idIndexes = {};
  }

  /**
   * resets internal data structure by type
   *
   * @method resetByType
   * @param {String} type - model type to reset
   */
  resetByType(type) {
    const { recordKegs, idIndexes } = this;
    idIndexes[type] = {};
    recordKegs[type] = A();
  }

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
  }

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
    const factory = this._getFactoryForType(options.modelFactory || type);
    const recordKeg = this._getRecordKegForType(type);
    const idIndex = this._getIdIndexForType(type);
    const namespace = options.namespace || this.defaultNamespace;
    const identifierField = factory.identifierField || KegService.identifierField;
    const owner = getOwner(this);

    const returnedRecords = A();
    for (let i = 0; i < rawRecords.length; i++) {
      const id = rawRecords[i][identifierField];
      const existingRecord = this.getById(type, id, namespace);

      if (existingRecord) {
        if (existingRecord.partialData && !rawRecords[i].partialData) {
          delete existingRecord.partialData;
        }
        setProperties(existingRecord, rawRecords[i]);
        returnedRecords.pushObject(existingRecord);
      } else {
        let newRecord = factory.create(Object.assign({}, owner.ownerInjection(), rawRecords[i]));

        idIndex[`${namespace}.${id}`] = newRecord;
        recordKeg.pushObject(newRecord);
        returnedRecords.pushObject(newRecord);
      }
    }
    return returnedRecords;
  }

  /**
   * Fetches a record by its identifier
   *
   * @method getById
   * @param {String} type - type name of the model type
   * @param {String|Number} id - identifier value
   * @param {String} namespace - (optional) namespace for the id
   * @returns {Object|undefined} the found record
   */
  getById(type, id, namespace) {
    let idIndex = this._getIdIndexForType(type) || {};
    let source = namespace || this.defaultNamespace;
    return idIndex[`${source}.${id}`];
  }

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
  }

  /**
   * Fetches all records for a type
   *
   * @method getBy
   * @param {String} type - type name of the model type
   * @returns {Array} array of records of the provided type
   */
  all(type, namespace) {
    const all = this._getRecordKegForType(type);
    if (namespace && all.any(item => !!item.source)) {
      return A(all.filter(item => item.source === namespace));
    }
    return all;
  }

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
  }

  /**
   * Fetches records keg for a type or creates one
   *
   * @private
   * @method _getRecordKegForType
   * @param {String} type - type name of the model type
   * @returns {Object} - record keg
   */
  _getRecordKegForType(type) {
    const { recordKegs } = this;

    recordKegs[type] = recordKegs[type] || A();
    return recordKegs[type];
  }

  /**
   * Fetches id index for a type or creates one
   *
   * @private
   * @method _getIdIndexForType
   * @param {String} type - type name of the model type
   * @returns {Object} - record id index
   */
  _getIdIndexForType(type) {
    const { idIndexes } = this;

    idIndexes[type] = idIndexes[type] || {};
    return idIndexes[type];
  }
}
