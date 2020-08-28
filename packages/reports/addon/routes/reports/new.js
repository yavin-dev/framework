/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { reject } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';
import config from 'ember-get-config';

export default Route.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * @property {Service} naviVisualizations
   */
  naviVisualizations: service(),

  /**
   * @property {Service} compression
   */
  compression: service(),

  /**
   * @property {Service} metadataService - Navi Metadata Service
   */
  metadataService: service('navi-metadata'),

  /**
   * @property {Service} user
   */
  user: service(),

  /**
   * @method model
   * @override
   * @returns {Promise} route model
   */
  model(_, transition) {
    const queryParams =
      (transition &&
        (transition.queryParams || //Ember2.x support
          (transition.to && transition.to.queryParams))) ||
      {};

    // Allow for a report to be passed through the URL
    if (queryParams.model) {
      return this._deserializeUrlModel(queryParams.model);
    }

    return this._newModel();
  },

  /**
   * Transitions to newly created report
   *
   * @method afterModel
   * @param {DS.Model} report - resolved report model
   * @override
   */
  afterModel(report) {
    return this.replaceWith('reports.report.edit', get(report, 'tempId'));
  },

  /**
   * @method _deserializeUrlModel
   * @private
   * @param {String} modelString - compressed model
   * @returns {Promise} promise that resolves to new model
   */
  _deserializeUrlModel(modelString) {
    return get(this, 'compression')
      .decompressModel(modelString)
      .then(model => {
        return this.store.createRecord('report', model.clone());
      })
      .catch(() => reject(new Error('Could not parse model query param')));
  },

  /**
   * Returns a new model for this route
   *
   * @method _newModel
   * @private
   * @returns {Promise} route model
   */
  _newModel() {
    const author = this.user.getUser();
    const defaultVisualization = this.naviVisualizations.defaultVisualization();
    const table = this._getDefaultTable();

    const report = this.store.createRecord('report', {
      author,
      request: this.store.createFragment('bard-request-v2/request', {
        table: table.id,
        dataSource: table.source
      }),
      visualization: { type: defaultVisualization }
    });
    return report;
  },

  /**
   * Returns a default table model for new report
   *
   * @method _getDefaultTable
   * @private
   * @returns {Object} table model
   */
  _getDefaultTable() {
    const { metadataService } = this;
    let table = metadataService.all('table').findBy('id', config.navi.defaultDataTable);
    if (!table) {
      let tables = metadataService.all('table').sortBy('name');
      table = tables[0];
    }
    return table;
  }
});
