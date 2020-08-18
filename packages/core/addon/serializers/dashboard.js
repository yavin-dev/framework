/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import AssetSerializer from 'navi-core/serializers/asset';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import { getOwner } from '@ember/application';

function v1ToV2Filter(filter, metadataService) {
  let source = undefined;
  let dimension = undefined; // the filter.dimension can be stored as dataSource.dimension
  if (filter.dimension.includes('.')) {
    [source, ...dimension] = filter.dimension.split('.');
    dimension = dimension.join('.');
  } else {
    dimension = filter.dimension;
  }
  const matchesField = d => d.id === dimension;
  const matchingDimensions = metadataService.all('dimension', source).filter(matchesField);
  const matchingTimeDimensions = metadataService.all('timeDimension', source).filter(matchesField);
  let type;
  if (matchingDimensions.length === 0 && matchingTimeDimensions.length === 1) {
    type = 'timeDimension';
    source = matchingTimeDimensions[0].source;
  } else if (matchingDimensions.length === 1 && matchingTimeDimensions.length === 0) {
    type = 'dimension';
    source = matchingDimensions[0].source;
  }

  // TODO: no exact match, have better handling
  type = type || 'dimension';
  source = source || getDefaultDataSourceName();

  return {
    type,
    field: filter.dimension,
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

      if (payload.attributes.filters.some(f => 'dimension' in f)) {
        const metadataService = getOwner(this).lookup('service:navi-metadata');
        newPayload.attributes.filters = newPayload.attributes.filters.map(filter =>
          v1ToV2Filter(filter, metadataService)
        );
      } else {
        newPayload.attributes.filters = newPayload.attributes.filters.map(filter => {
          let dataSourceName, field;
          if (filter.field.includes('.')) {
            [dataSourceName, field] = filter.field.split('.');
          } else {
            dataSourceName = getDefaultDataSourceName();
            field = filter.field;
          }
          return {
            ...filter,
            field,
            source: dataSourceName
          };
        });
      }

      return this._super(type, newPayload);
    }
    return this._super(...arguments);
  },

  /**
   * Overrides default serialize method to add datasources to filter object
   *
   * @param {Snapshot} snapshot
   * @returns {Object} serialized dashboard
   */
  serialize(snapshot) {
    const buildKey = (dimension, values) => `${dimension}[${values.join(',')}]`;
    const filterSources = snapshot.attr('filters').reduce((dimensionSources, filter) => {
      // TODO: Canonical column name
      dimensionSources[buildKey(filter.attr('field'), filter.attr('values'))] = filter.attr('source');
      return dimensionSources;
    }, {});
    const dashboard = this._super(...arguments);
    dashboard.data.attributes.filters = dashboard.data.attributes.filters.map(filter => {
      const key = buildKey(filter.field, filter.values);
      filter.field = filterSources[key] ? `${filterSources[key]}.${filter.field}` : filter.field;
      return filter;
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
