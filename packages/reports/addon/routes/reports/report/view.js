/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import $ from 'jquery';
import isEqual from 'lodash/isEqual';
import { isForbiddenError } from 'ember-ajax/errors';

const { get, set } = Ember;

export default Ember.Route.extend({
  /**
   * @property {Service} facts - instance of bard facts service
   */
  facts: Ember.inject.service('bard-facts'),

  /**
   * @property {Service} naviVisualizations - instance of navi visualizations service
   */
  naviVisualizations: Ember.inject.service(),

  /**
   * @property {Object} requestOptions - options for bard request
   */
  requestOptions: {
    page: 1,
    perPage: 10000,
    clientId: 'customReports'
  },

  /**
   * @property {Object} parentModel - object containing request to view
   */
  parentModel: Ember.computed(function() {
    return this.modelFor('reports.report');
  }).volatile(),

  /**
   * @method model
   * @returns {Promise} response from fact service
   */
  model() {
    let report = get(this, 'parentModel'),
        request = get(report, 'request'),
        serializedRequest = request.serialize(),
        requestOptions = $.extend(true, get(this, 'requestOptions'), {
          customHeaders: {
            uiView: `report.spv.${get(report, 'id')}`
          }
        });

        // Wrap the response in a promise object so we can manually handle loading spinners
    return get(this, 'facts').fetch(serializedRequest, requestOptions)
      .then(response => {
        set(this, 'previousRequest', serializedRequest);
        this._setValidVisualizationType(request, report);
        this._setValidVisualizationConfig(request, report, response.response);

        return response.response;
      }).catch(response => {
        if (isForbiddenError(response)) {
          this.transitionTo('reports.report.unauthorized', get(report, 'id'));
        } else {
          return Ember.RSVP.reject(response);
        }
      });
  },

  /**
   * Makes sure the visualization type is valid for the request
   * If it is not currently valid, a default will be provided
   * @method _setValidVisualizationType
   * @private
   * @param {Object} request
   * @param {Object} report
   */
  _setValidVisualizationType(request, report) {
    let visualizationModel = get(report, 'visualization'),
        visualizationService = get(this, 'naviVisualizations'),
        visualizationManifest = visualizationService.getManifest(get(visualizationModel, 'type'));

        // If the current type is already valid, don't bother setting a new type
    if (!visualizationManifest.typeIsValid(request)) {
      visualizationModel = this.store.createFragment(visualizationService.defaultVisualization());
      set(report, 'visualization', visualizationModel);
    }
  },

  /**
   * Makes sure the visualization config is valid for the request
   * If it is not currently valid, a default will be provided
   * @method _setValidVisualizationType
   * @private
   * @param {Object} request
   * @param {Object} report
   * @param {Object} response
   */
  _setValidVisualizationConfig(request, report, response) {
    let visualizationModel = get(report, 'visualization');

    if (!visualizationModel.isValidForRequest(request)) {
      visualizationModel.rebuildConfig(request, response);
    }
  },

  actions: {
    /**
     * @action runReport
     * @param {Object} report - object with report id
     */
    runReport() {
      let report = get(this, 'parentModel'),
          request = get(report, 'request').serialize(),
          previousRequest = get(this, 'previousRequest');

      // Run the report only if there are request changes
      if (!isEqual(request, previousRequest)) {
        return this.refresh();
      }
    },

    /**
     * Code to run before validating the request
     *
     * @action beforeValidate
     * @returns {Void}
     */
    beforeValidate() {
      // noop
    },

    /**
     * @action didTransition
     */
    didTransition() {
      this.send('setMode', 'view');
      this.send('setHasReportRun', 'true');
    },

    /**
     * @action onVisualizationTypeUpdate
     * @param {String} type
     */
    onVisualizationTypeUpdate(type) {
      let report   = get(this, 'parentModel'),
          request  = get(report, 'request'),
          response = this.currentModel;

      let newVisualization = this.store.createFragment(type, {
        _request: request //Provide request for validation
      });
      newVisualization.rebuildConfig(request, response);
      set(report, 'visualization', newVisualization);
    }
  }
});
