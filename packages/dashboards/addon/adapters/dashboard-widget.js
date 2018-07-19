/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import BaseAdapter from 'navi-core/adapters/base-json-adapter';

const { get } = Ember;

export default BaseAdapter.extend({
  /**
   * @method urlForUpdateRecord
   * @override
   * @param {String} id - id of record
   * @param {String} modelName - model name of record
   * @param {DS.Snapshot} snapshot - update model contents
   * @return {String} url
   */
  urlForUpdateRecord(id, modelName, snapshot) {
    return this._urlWithDashboardId(modelName, snapshot);
  },

  /**
   * @method urlForCreateRecord
   * @override
   * @param {String} modelName - model name of record
   * @param {DS.Snapshot} snapshot - update model contents
   * @return {String} url
   */
  urlForCreateRecord(modelName, snapshot) {
    return this._urlWithDashboardId(modelName, snapshot);
  },

  /**
   * @method urlForDeleteRecord
   * @override
   * @param {String} id - id of record
   * @param {String} modelName - model name of record
   * @param {DS.Snapshot} snapshot - update model contents
   * @return {String} url
   */
  urlForDeleteRecord(id, modelName, snapshot) {
    return this._urlWithDashboardId(modelName, snapshot);
  },

  /**
   * Build a url to a widget with the parent dashboard
   * id in its path
   *
   * @method _urlWithDashboardId
   * @param {String} modelName - model name of record
   * @param {DS.Snapshot} snapshot - update model contents
   * @return {String} url
   */
  _urlWithDashboardId(modelName, snapshot) {
    let host = get(this, 'host'),
      prefix = this.urlPrefix(),
      dashboardId = snapshot.belongsTo('dashboard').id,
      widgetId = get(snapshot, 'id') || '';

    let url = `${prefix}/dashboards/${dashboardId}/widgets/${widgetId}`;

    if (!host && url.charAt(0) !== '/') {
      url = `/${url}`;
    }

    return url;
  }
});
