/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import AssetSerializer from 'navi-core/serializers/asset';
import { inject as service } from '@ember/service';
import { canonicalizeColumn } from '@yavin/client/utils/column';

function v1ToV2Filter(filter, defaultDataSource) {
  let source;
  let dimension;
  const dotOccurences = (filter.dimension.match(/\./g) ?? []).length;
  if (dotOccurences > 0) {
    /**
     * filter.dimension might be stored as:
     * dataSource.dimension (fili)
     * dataSource.table.dimension (elide or dateTime in fili)
     * dataSource.namespace.table.dimension (elide)
     */
    const split = filter.dimension.split('.');
    source = split.slice(0, dotOccurences > 2 ? 2 : 1).join('.');
    dimension = split.slice(dotOccurences > 1 ? -2 : -1).join('.');
  } else {
    source = defaultDataSource;
    dimension = filter.dimension;
  }

  const type = filter.type ?? 'dimension';

  const parameters =
    type === 'timeDimension'
      ? {
          grain: filter.field,
        }
      : {
          field: filter.field,
        };

  return {
    type,
    field: dimension,
    parameters,
    operator: filter.operator,
    values: filter.values,
    source,
  };
}

export default AssetSerializer.extend({
  yavinClient: service(),

  /**
   * @method normalize
   * @override
   *
   * Replace null filters value with empty array
   */
  normalize(type, payload) {
    if (type.modelName === 'dashboard') {
      const newPayload = Object.assign({}, payload);
      if (!Array.isArray(payload?.attributes?.filters)) {
        newPayload.attributes.filters = [];
      }

      const defaultDataSource = this.yavinClient.clientConfig.getDefaultDataSource().name;
      // TODO: We always convert since we only persist v1 filters
      newPayload.attributes.filters = newPayload.attributes.filters.map((filter) =>
        v1ToV2Filter(filter, defaultDataSource)
      );

      return this._super(type, newPayload);
    }
    return this._super(...arguments);
  },

  /**
   * Overrides default serialize method to add datasources to filter object
   *
   * TODO: This serializes to v1 format, we should support v2 filters for dashboards
   *
   * @param {Snapshot} snapshot
   * @returns {Object} serialized dashboard
   */
  serialize(snapshot) {
    const buildKey = (filter) => canonicalizeColumn(filter);
    const filterSources = Object.fromEntries(
      snapshot.attr('filters').map((filter) => [filter.record.canonicalName, filter.attr('source')])
    );
    const dashboard = this._super(...arguments);
    dashboard.data.attributes.filters = dashboard.data.attributes.filters.map((filter) => {
      const source = filterSources[buildKey(filter)];
      return {
        type: filter.type,
        dimension: `${source}.${filter.field}`,
        operator: filter.operator,
        field: filter.type === 'timeDimension' ? filter.parameters?.grain : filter.parameters?.field,
        values: filter.values,
      };
    });
    return dashboard;
  },

  /**
   * @method normalizeFindRecordResponse
   * @override
   *
   * Replace relationship data with nested resource links
   */
  normalizeFindManyResponse(store, type, payload) {
    const dashboards = payload.data;

    dashboards.forEach((dashboard) => {
      this._addLinks(dashboard, 'widgets');
    });

    return this._super(...arguments);
  },

  /**
   * @method normalizeFindRecordResponse
   * @override
   *
   * Replace relationship data with nested resource links
   */
  normalizeFindRecordResponse(store, type, payload) {
    this._addLinks(payload.data, 'widgets');

    return this._super(...arguments);
  },

  /**
   * @method _addLinks
   * @private
   *
   * Adds nested relationship links to the payload
   *
   * @param {Object} dashboard - payload data
   * @param {String} type - relationship type
   * @returns {Object} dashboard - modified dashboard with links
   */
  _addLinks(dashboard, type) {
    delete dashboard.relationships[type].data;

    dashboard.relationships[type].links = {
      related: `/dashboards/${dashboard.id}/${type}`,
    };

    return dashboard;
  },
});
