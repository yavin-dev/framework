/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that can store and fetch records
 */
type Identifier = string | number;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KegRecord = Record<string, any>;

type InsertOptions = {
  identifierField: string; // id field for record, defaults to 'id'
  namespace: string; // namespace to store data under, defaults to 'navi'
};

type FilterFn = (value: KegRecord, index: number, array: KegRecord[]) => boolean;

export default class Keg {
  /**
   * field name of the id field
   */
  static identifierField = 'id';

  /**
   * Object of record arrays
   */
  recordKegs: Record<string, KegRecord[]> = {};

  /**
   * Object of record indexes
   */
  idIndexes: Record<string, Record<string, KegRecord>> = {};

  defaultNamespace: string;

  constructor(defaultNamespace = 'yavin') {
    this.defaultNamespace = defaultNamespace;
  }

  /**
   * Resets internal data structures
   *
   * @returns {undefined}
   */
  reset(): void {
    this.recordKegs = {};
    this.idIndexes = {};
  }

  /**
   * resets internal data structure by type
   *
   * @param type - model type to reset
   */
  resetByType(type: string): void {
    const { recordKegs, idIndexes } = this;
    idIndexes[type] = {};
    recordKegs[type] = [];
  }

  /**
   * Inserts a single record into the store
   *
   * @param type - name of the model type
   * @param record - record to be inserted into the keg
   * @param options - config object
   */
  insert(type: string, record: KegRecord, options: Partial<InsertOptions> = {}): KegRecord {
    return this.insertMany(type, [record], options)[0];
  }

  /**
   * Inserts an array of records into the store
   *
   * @param type - type name of the model type
   * @param record - record to be inserted into the keg
   * @param options - config object
   */
  insertMany(type: string, records: Array<KegRecord>, options: Partial<InsertOptions> = {}): KegRecord[] {
    const recordKeg = this._getRecordKegForType(type);
    const idIndex = this._getIdIndexForType(type);
    const namespace = options.namespace || this.defaultNamespace;
    const identifierField = options.identifierField || Keg.identifierField;

    const returnedRecords: KegRecord[] = [];
    for (let i = 0; i < records.length; i++) {
      const id = records[i][identifierField] as Identifier;
      const existingRecord = this.getById(type, id, namespace);

      if (existingRecord) {
        if (existingRecord.partialData && !records[i].partialData) {
          delete existingRecord.partialData;
        }
        Object.assign(existingRecord, records[i]);
        returnedRecords.push(existingRecord);
      } else {
        const record = records[i];
        idIndex[`${namespace}.${id}`] = record;
        recordKeg.push(record);
        returnedRecords.push(record);
      }
    }
    return returnedRecords;
  }

  /**
   * Fetches a record by its identifier
   *
   * @param type - type name of the model type
   * @param id - identifier value
   * @param namespace - (optional) namespace for the id
   * @returns the found record
   */
  getById(type: string, id: Identifier, namespace?: string): KegRecord | undefined {
    let idIndex = this._getIdIndexForType(type) || {};
    let source = namespace || this.defaultNamespace;
    return idIndex[`${source}.${id}`];
  }

  /**
   * Fetches a record by the provided clause
   *
   * @param type - type name of the model type
   * @param clause
   * @returns array of found records
   */
  getBy(type: string, clause: Record<string, unknown | Array<unknown>> | FilterFn): KegRecord[] {
    const recordKeg = this._getRecordKegForType(type);
    let foundRecords: KegRecord[] = [];

    if (typeof clause === 'object') {
      foundRecords = recordKeg;

      Object.keys(clause).forEach((field) => {
        foundRecords = foundRecords.filter((item) => {
          const clauseValue = clause[field];
          if (Array.isArray(clauseValue)) {
            return clauseValue.indexOf(item[field]) > -1;
          } else {
            return clauseValue === item[field];
          }
        });
      });
    } else if (typeof clause === 'function') {
      foundRecords = recordKeg.filter(clause);
    }
    return foundRecords;
  }

  /**
   * Fetches all records for a type
   *
   * @param type - type name of the model type
   * @param namespace - (optional) namespace for the id
   * @returns array of records of the provided type
   */
  all(type: string, namespace?: string): KegRecord[] {
    const all = this._getRecordKegForType(type);
    if (namespace && all.some((item) => !!item.source)) {
      return all.filter((item) => item.source === namespace);
    }
    return all;
  }

  /**
   * Fetches records keg for a type or creates one
   *
   * @param type - type name of the model type
   * @returns record keg
   */
  _getRecordKegForType(type: string): KegRecord[] {
    const { recordKegs } = this;
    let recordKegForType = recordKegs[type] ?? [];
    recordKegs[type] = recordKegForType;
    return recordKegForType;
  }

  /**
   * Fetches id index for a type or creates one
   *
   * @param type - type name of the model type
   * @returns record id index
   */
  _getIdIndexForType(type: string): Record<string, KegRecord> {
    const { idIndexes } = this;

    idIndexes[type] = idIndexes[type] || {};
    return idIndexes[type];
  }
}
