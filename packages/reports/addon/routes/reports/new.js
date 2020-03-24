/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import { reject } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';
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
   * @property {Service} metadataService - Bard Metadata Service
   */
  metadataService: service('bard-metadata'),

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
    let author = get(this, 'user').getUser();

    // Default to first data source + time grain
    let defaultVisualization = get(this, 'naviVisualizations').defaultVisualization(),
      table = this._getDefaultTable(),
      timeGrain = this._getDefaultTimeGrainName(table);

    let report = this.store.createRecord('report', {
      author,
      request: this.store.createFragment('bard-request/request', {
        logicalTable: this.store.createFragment('bard-request/fragments/logicalTable', {
          table,
          timeGrain: timeGrain
        }),
        dataSource: table.source,
        responseFormat: 'csv'
      }),
      visualization: { type: defaultVisualization }
    });

    get(report, 'request.intervals').createFragment({
      interval: new Interval(new Duration(DefaultIntervals[timeGrain]), 'current')
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
    let table = get(this, 'metadataService')
      .all('table')
      .findBy('id', get(config, 'navi.defaultDataTable'));

    if (!table) {
      let dataSourceTables = get(this, 'metadataService')
        .all('table')
        .sortBy('name');
      table = dataSourceTables[0];
    }

    return table;
  },

  /**
   * Returns a default time grain name for new report
   *
   * @method _getDefaultTimeGrainName
   * @private
   * @returns {String} time grain name
   */
  _getDefaultTimeGrainName(table) {
    let timeGrainName = get(config, 'navi.defaultTimeGrain'),
      tableTimeGrains = A(get(table, 'timeGrains')),
      timeGrainExist = tableTimeGrains.find(grain => grain.id === timeGrainName);

    if (!timeGrainExist) {
      timeGrainName = get(tableTimeGrains, 'firstObject').id;
    }

    return timeGrainName;
  }
});
