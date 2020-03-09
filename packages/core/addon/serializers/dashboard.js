/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import AssetSerializer from 'navi-core/serializers/asset';
import { get } from '@ember/object';

export default AssetSerializer.extend({
  /**
   * @method normalize
   * @override
   *
   * Replace null filters value with empty array
   */
  normalize(type, payload) {
    if (get(type, 'modelName') === 'dashboard' && get(payload, 'attributes.filters') === null) {
      const newPayload = Object.assign({}, payload);
      newPayload.attributes.filters = [];
      return this._super(type, newPayload);
    }
    return this._super(...arguments);
  },

  serialize(snapshot) {
    const filterSources = snapshot.attr('filters').map(filter => filter.attr('dimension').source);
    const dashboard = this._super(...arguments);
    dashboard.data.attributes.filters = dashboard.data.attributes.filters.map((filter, i) => {
      filter.dimension = filterSources[i] ? `${filterSources[i]}.${filter.dimension}` : filter.dimension;
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
