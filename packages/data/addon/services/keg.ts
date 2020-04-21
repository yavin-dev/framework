/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that can store and fetch records
 */
import { typeOf } from '@ember/utils';
import EmberArray, { A } from '@ember/array';
import MutableArray from '@ember/array/mutable';
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { setProperties } from '@ember/object';

type Identifier = string | number;
type Record = unknown & {
  partialData?: boolean;
  [key: string]: unknown;
};
interface Factory {
  create(obj: object): Record;
  identifierField: string;
}
type Options = {
  modelFactory: string; // name of explicit modelFactory to store
  namespace: string; // namespace to store data under, defaults to 'navi'
};

type FilterFn = (value: Record, index: number, array: Record[]) => boolean;

export default class KegService extends Service {
  /**
   * @property {String} identifierField - field name of the id field
   */
  static identifierField = 'id';

  /**
   * @property {Object} recordKeg - Object of record arrays
   */
  recordKegs: Dict<MutableArray<Record>> = {};

  /**
   * @property {Object} idIndexes - Object of record idexes
   */
  idIndexes: Dict<Dict<Record>> = {};

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
  reset(): void {
    this.recordKegs = {};
    this.idIndexes = {};
  }

  /**
   * resets internal data structure by type
   *
   * @method resetByType
   * @param {string} type - model type to reset
   */
  resetByType(type: string): void {
    const { recordKegs, idIndexes } = this;
    idIndexes[type] = {};
    recordKegs[type] = A();
  }

  /**
   * Pushes a single record into the store
   *
   * @method push
   * @param {string} type- name of the model type
   * @param {object} rawRecord - object that is passed the type factory
   * @param {Object} [options] - config object
   * @param {String} [options.modelFactory] - name of explicit modelFactory to store
   * @returns {Object} record that was pushed to the keg
   */
  push(type: string, rawRecord: Record, options: Partial<Options>) {
    return this.pushMany(type, [rawRecord], options).get('firstObject');
  }

  /**
   * Pushes an array of records into the store
   *
   * @method pushMany
   * @param {string} type - type name of the model type
   * @param {Array} rawRecords - array of objects that are passed the type factory
   * @param {Options} [options] - config object
   * @returns {Array} records that were pushed to the keg
   */
  pushMany(type: string, rawRecords: Array<Record>, options: Partial<Options> = {}) {
    const factory = this._getFactoryForType(options.modelFactory || type);
    const recordKeg = this._getRecordKegForType(type);
    const idIndex = this._getIdIndexForType(type);
    const namespace = options.namespace || this.defaultNamespace;
    const identifierField = factory?.identifierField || KegService.identifierField;
    const owner = getOwner(this);

    const returnedRecords = A();
    for (let i = 0; i < rawRecords.length; i++) {
      const id = rawRecords[i][identifierField] as Identifier;
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
   * @param {string} type - type name of the model type
   * @param {Identifier} id - identifier value
   * @param {string} namespace - (optional) namespace for the id
   * @returns {Object|undefined} the found record
   */
  getById(type: string, id: Identifier, namespace?: string): Record | undefined {
    let idIndex = this._getIdIndexForType(type) || {};
    let source = namespace || this.defaultNamespace;
    return idIndex[`${source}.${id}`];
  }

  /**
   * Fetches a record by the provided clause
   *
   * @method getBy
   * @param {String} type - type name of the model type
   * @param {Dict<unknown|Array<unknown>>|FilterFn} clause
   * @returns {EmberArray<Record>} array of found records
   */
  getBy(type: string, clause: Dict<unknown | Array<unknown>> | FilterFn): EmberArray<Record> {
    const recordKeg = this._getRecordKegForType(type);
    let foundRecords: EmberArray<Record> = A();

    if (typeof clause === 'object') {
      foundRecords = recordKeg;

      Object.keys(clause).forEach(field => {
        foundRecords = A(
          foundRecords.filter(item => {
            const clauseValue = clause[field];
            if (Array.isArray(clauseValue)) {
              return clauseValue.indexOf(item[field]) > -1;
            } else {
              return clauseValue === item[field];
            }
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
   * @param {string} type - type name of the model type
   * @param {string} namespace - (optional) namespace for the id
   * @returns {Array} array of records of the provided type
   */
  all(type: string, namespace: string): EmberArray<Record> {
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
   * @param {string} type - type name of the model type
   * @returns {Object} - model factory
   */
  _getFactoryForType(type: string | Factory): Factory {
    if (typeOf(type) === 'string') {
      return getOwner(this).factoryFor(`model:${type}`)?.class;
    } else {
      return type as Factory;
    }
  }

  /**
   * Fetches records keg for a type or creates one
   *
   * @private
   * @method _getRecordKegForType
   * @param {string} type - type name of the model type
   * @returns {EmberArray<Record>} - record keg
   */
  _getRecordKegForType(type: string): MutableArray<Record> {
    const { recordKegs } = this;

    recordKegs[type] = recordKegs[type] || A();
    return recordKegs[type];
  }

  /**
   * Fetches id index for a type or creates one
   *
   * @private
   * @method _getIdIndexForType
   * @param {string} type - type name of the model type
   * @returns {Dict<Record>} - record id index
   */
  _getIdIndexForType(type: string): Dict<Record> {
    const { idIndexes } = this;

    idIndexes[type] = idIndexes[type] || {};
    return idIndexes[type];
  }
}

declare module '@ember/service' {
  interface Registry {
    keg: KegService;
  }
}
