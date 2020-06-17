/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import JSONSerializer from '@ember-data/serializer/json';
import { inject as service } from '@ember/service';
import { normalizeV1toV2 } from 'navi-core/utils/request';

export default class RequestSerializer extends JSONSerializer {
  /**
   * @property {Service}
   */
  @service bardMetadata;

  /**
   * Normalizes the JSON payload returned by the persistence layer
   * @override
   * @param {Model} typeClass
   * @param {Object} request
   * @return {Object} normalized request
   */
  normalize(typeClass, request) {
    let normalized;

    //normalize v1 into v2
    if (request.requestVersion === 'v1') {
      //if datasource is undefined, try to infer from metadata
      const namespace = request.dataSource || this.bardMetadata.getTableNamespace(request.logicalTable.table);

      normalized = normalizeV1toV2(request, namespace);
    } else {
      normalized = Object.assign({}, request);
    }

    //copy source property from request
    ['columns', 'filters', 'sorts'].forEach(attr =>
      normalized[attr].forEach(fragment => (fragment.source = normalized.dataSource))
    );

    return super.normalize(typeClass, normalized);
  }
}
