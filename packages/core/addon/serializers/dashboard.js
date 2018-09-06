/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseSerializer from 'navi-core/serializers/base-json-serializer';

export default BaseSerializer.extend({
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
      related: `/dashboards/${dashboard.id}/${type}`
    };

    return dashboard;
  }
});
