/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import AssetSerializer from 'navi-core/serializers/asset';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import { getOwner } from '@ember/application';

function v1ToV2Filter(filter, metadataService) {
  let source;
  let dimension; // the filter.dimension might be stored as dataSource.dimension
  if (filter.dimension.includes('.')) {
    [source, ...dimension] = filter.dimension.split('.');
    dimension = dimension.join('.');
  } else {
    source = getDefaultDataSourceName();
    dimension = filter.dimension;
  }

  const dimensionMetadata = metadataService.getById('dimension', dimension, source);
  const timeDimensionMetadata = metadataService.getById('timeDimension', dimension, source);
  let type;
  if (!dimensionMetadata && timeDimensionMetadata) {
    type = 'timeDimension';
  } else if (dimensionMetadata && !timeDimensionMetadata) {
    type = 'dimension';
  } else {
    type = 'dimension'; //fallback to just dimension
  }

  return {
    type,
    field: dimension,
    parameters: {
      field: filter.field
    },
    operator: filter.operator,
    values: filter.values,
    source
  };
}

export default AssetSerializer.extend({
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

      const metadataService = getOwner(this).lookup('service:navi-metadata');
      // TODO: We always convert since we only persist v1 filters
      newPayload.attributes.filters = newPayload.attributes.filters.map(filter =>
        v1ToV2Filter(filter, metadataService)
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
    const buildKey = filter => `${filter.field}(field=${filter.parameters.field})`;
    const filterSources = Object.fromEntries(
      snapshot.attr('filters').map(filter => [filter.record.canonicalName, filter.attr('source')])
    );
    const dashboard = this._super(...arguments);
    dashboard.data.attributes.filters = dashboard.data.attributes.filters.map(filter => {
      const source = filterSources[buildKey(filter)];
      return {
        dimension: `${source}.${filter.field}`,
        operator: filter.operator,
        field: filter.parameters.field,
        values: filter.values
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

    dashboards.forEach(dashboard => {
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
      related: `/dashboards/${dashboard.id}/${type}`
    };

    return dashboard;
  }
});
