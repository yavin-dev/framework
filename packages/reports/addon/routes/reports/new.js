/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import DS from 'ember-data';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import DefaultIntervals from 'navi-reports/utils/enums/default-intervals';
import config from 'ember-get-config';

const { get } = Ember;

export default Ember.Route.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: Ember.inject.service(),

  /**
   * @property {Service} naviVisualizations
   */
  naviVisualizations: Ember.inject.service(),

  /**
   * @property {Service} modelCompression
   */
  modelCompression: Ember.inject.service(),

  /**
   * @property {Service} metadataService - Bard Metadata Service
   */
  metadataService: Ember.inject.service('bard-metadata'),

  /**
   * @property {Service} user
   */
  user: Ember.inject.service(),

  /**
   * @method model
   * @override
   * @returns {Promise} route model
   */
  model(params, { queryParams }) {
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
    return this.replaceWith('reports.report.new', get(report, 'tempId'));
  },

  /**
   * @method _deserializeUrlModel
   * @private
   * @param {String} modelString - compressed model
   * @returns {Promise} promise that resolves to new model
   */
  _deserializeUrlModel(modelString) {
    return get(this, 'modelCompression')
      .decompress(modelString)
      .then(model => {
        // Always return a new model
        model._internalModel.currentState = DS.RootState.loaded.created;
        model.set('id', null);

        return model;
      })
      .catch(() => Ember.RSVP.reject(new Error('Could not parse model query param')));
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
      timeGrainName = this._getDefaultTimeGrainName(table);

    let report = this.store.createRecord('report', {
      author,
      request: this.store.createFragment('bard-request/request', {
        logicalTable: this.store.createFragment('bard-request/fragments/logicalTable', {
          table,
          timeGrainName
        }),
        responseFormat: 'csv'
      }),
      visualization: { type: defaultVisualization }
    });

    get(report, 'request.intervals').createFragment({
      interval: new Interval(new Duration(DefaultIntervals[timeGrainName]), 'current')
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
      .findBy('name', get(config, 'navi.defaultDataTable'));

    if (!table) {
      let dataSourceTables = get(this, 'metadataService')
        .all('table')
        .sortBy('longName');
      table = get(dataSourceTables, 'firstObject');
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
      tableTimeGrains = Ember.A(get(table, 'timeGrains')),
      timeGrainExist = tableTimeGrains.findBy('name', timeGrainName);

    if (!timeGrainExist) {
      timeGrainName = get(tableTimeGrains, 'firstObject.name');
    }

    return timeGrainName;
  }
});
