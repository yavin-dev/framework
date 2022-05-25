/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
type Identifier = string | number;

type InternalProps = { partialData?: boolean };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KegRecord = Record<string, any> & InternalProps;
type DefaultRegistry = Record<string, KegRecord>;

type InsertOptions = {
  identifierField: string; // id field for record, defaults to 'id'
  namespace: string; // namespace to store data under, defaults to 'navi'
};

type FilterFn = (value: KegRecord, index: number, array: KegRecord[]) => boolean;

type RecordsByType<Registry extends DefaultRegistry> = Partial<{
  [P in keyof Registry]: Array<Registry[P]>;
}>;

type RecordsById<Registry extends DefaultRegistry> = Partial<{
  [P in keyof Registry]: Record<Identifier, Registry[P]>;
}>;

export default class Keg<Registry extends DefaultRegistry = DefaultRegistry> {
  /**
   * default namespace to store records in
   */
  defaultNamespace: string;

  /**
   * field name of the id field
   */
  defaultIdField: string;

  /**
   * Object of record arrays
   */
  recordKegs: RecordsByType<Registry> = {};

  /**
   * Object of record indexes
   */
  idIndexes: RecordsById<Registry> = {};

  constructor(options: Partial<InsertOptions> = {}) {
    this.defaultNamespace = options.namespace ?? 'default';
    this.defaultIdField = options.identifierField ?? 'id';
  }

  /**
   * Resets internal data structures
   *
   * @returns
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
  resetByType<T extends keyof Registry>(type: T): void {
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
  insert<T extends keyof Registry>(type: T, record: Registry[T], options: Partial<InsertOptions> = {}): Registry[T] {
    return this.insertMany(type, [record], options)[0];
  }

  /**
   * Inserts an array of records into the store
   *
   * @param type - type name of the model type
   * @param records - records to be inserted into the keg
   * @param options - config object
   */
  insertMany<T extends keyof Registry>(
    type: T,
    records: Array<Registry[T]>,
    options: Partial<InsertOptions> = {}
  ): Array<Registry[T]> {
    const recordKeg = this._getRecordKegForType(type);
    const idIndex = this._getIdIndexForType(type);
    const namespace = options.namespace || this.defaultNamespace;
    const identifierField = options.identifierField || this.defaultIdField;

    const returnedRecords: Array<Registry[T]> = [];
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
  getById<T extends keyof Registry>(type: T, id: Identifier, namespace?: string): Registry[T] | undefined {
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
  getBy<T extends keyof Registry>(
    type: T,
    clause: Record<string, unknown | Array<unknown>> | FilterFn
  ): Array<Registry[T]> {
    const recordKeg = this._getRecordKegForType(type);
    let foundRecords: Array<Registry[T]> = [];

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
  all<T extends keyof Registry>(type: T, namespace?: string): Array<Registry[T]> {
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
  _getRecordKegForType<T extends keyof Registry>(type: T): Array<Registry[T]> {
    const { recordKegs } = this;
    const recordKegForType = recordKegs[type] ?? [];
    recordKegs[type] = recordKegForType;
    return recordKegForType;
  }

  /**
   * Fetches id index for a type or creates one
   *
   * @param type - type name of the model type
   * @returns record id index
   */
  _getIdIndexForType<T extends keyof Registry>(type: T): Record<Identifier, Registry[T]> {
    const { idIndexes } = this;
    const idx = idIndexes[type] ?? {};
    idIndexes[type] = idx;
    return idx;
  }
}
