/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import JSONSerializer from '@ember-data/serializer/json';
import { inject as service } from '@ember/service';
import { canonicalizeColumn } from '@yavin/client/utils/column';
import { assert } from '@ember/debug';

export default class RequestSerializer extends JSONSerializer {
  /**
   * @property {Service}
   */
  @service naviMetadata;

  /**
   * Looks up data source name for a table name
   * @param {String} tableId
   * @returns {string} - data source name
   */
  getTableNamespace(tableId) {
    const tableModel = this.naviMetadata.all('table').find(({ id }) => id === tableId);
    return tableModel.source;
  }

  /**
   * Normalizes the JSON payload returned by the persistence layer
   * @override
   * @param {Model} typeClass
   * @param {Object} request
   * @return {Object} normalized request
   */
  normalize(typeClass, request) {
    const normalized = { ...request };

    //copy source property from request
    ['columns', 'filters', 'sorts'].forEach((attr) =>
      normalized[attr].forEach((fragment) => (fragment.source = normalized.dataSource))
    );

    // add cid to sorts
    const map = new Map();
    normalized.columns?.forEach(({ type, field, parameters, cid }) => {
      const canonicalName = canonicalizeColumn({ field, parameters });
      assert('columns must have cid', cid);
      map.set(`${type}|${canonicalName}`, cid);
    });
    normalized.sorts?.forEach((sort) => {
      const { type, field, parameters } = sort;
      const canonicalName = canonicalizeColumn({ field, parameters });
      const cid = map.get(`${type}|${canonicalName}`);
      assert('sorts must have cid', cid);
      sort.cid = cid;
    });

    return super.normalize(typeClass, normalized);
  }
}
