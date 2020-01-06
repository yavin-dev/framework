/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { get, set, computed } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import merge from 'lodash/merge';
import { isForbiddenError } from 'ember-ajax/errors';
import { reject } from 'rsvp';

export default Route.extend({
  /**
   * @property {Service} facts - instance of navi facts service
   */
  facts: service('navi-facts'),

  /**
   * @property {Service} naviVisualizations - instance of navi visualizations service
   */
  naviVisualizations: service(),

  /**
   * @property {Object} requestOptions - options for bard request
   */
  requestOptions: computed(() => ({
    page: 1,
    perPage: 10000,
    clientId: 'customReports'
  })),

  /**
   * @property {Object} parentModel - object containing request to view
   */
  parentModel: computed(function() {
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
      requestOptions = merge({}, get(this, 'requestOptions'), {
        customHeaders: {
          uiView: `report.spv.${get(report, 'id')}`
        }
      });

    // Wrap the response in a promise object so we can manually handle loading spinners
    return get(this, 'facts')
      .fetch(serializedRequest, requestOptions)
      .then(response => {
        this._setValidVisualizationType(request, report);
        this._setValidVisualizationConfig(request, report, response.response);

        return response;
      })
      .catch(response => {
        if (isForbiddenError(response)) {
          this.transitionTo('reports.report.unauthorized', get(report, 'id'));
        } else {
          return reject(response);
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
   * @method _setValidVisualizationConfig
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

  /**
   * Returns whether the current request has already run
   * @method _hasRequestRun
   * @private
   * @returns {Boolean}
   */
  _hasRequestRun() {
    return this.controllerFor(this.routeName).get('hasRequestRun');
  },

  actions: {
    /**
     * Runs report if it has changed
     *
     * @action runReport
     * @returns {Transition|Void} - the model refresh transition
     */
    runReport() {
      // Run the report only if there are request changes
      if (!this._hasRequestRun()) {
        return this.refresh();
      } else {
        this.send('setReportState', 'completed');
      }
    },

    /**
     * Forces the report to be rerun, used when user explicitly pushes run button.
     *
     * @action forceRun
     * @returns {Transition} - refreshes model transition
     */
    forceRun() {
      return this.refresh();
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
     * @action loading
     */
    loading(transition) {
      /**
       * false is sent as the first argument due to a change in router_js
       * TODO: Remove false if this is ever removed
       * https://github.com/emberjs/ember.js/issues/17545
       */
      transition.send(false, 'setReportState', 'running');
      return true; // allows the loading template to be shown
    },

    /**
     * @action error
     */
    error(error, transition) {
      /**
       * false is sent as the first argument due to a change in router_js
       * TODO: Remove false if this is ever removed
       * https://github.com/emberjs/ember.js/issues/17545
       */
      transition.send(false, 'setReportState', 'failed');
      return true; // allows the error template to be shown
    },

    /**
     * @action didTransition
     */
    didTransition() {
      this.send('setReportState', 'completed');

      return true;
    },

    /**
     * @action onVisualizationTypeUpdate
     * @param {String} type
     */
    onVisualizationTypeUpdate(type) {
      let report = get(this, 'parentModel'),
        request = get(report, 'request'),
        response = this.currentModel.response;

      if (type === 'request-preview') {
        set(report, 'visualization', { type: 'request-preview' });
        return;
      }

      let newVisualization = this.store.createFragment(type, {
        _request: request //Provide request for validation
      });
      newVisualization.rebuildConfig(request, response);
      set(report, 'visualization', newVisualization);
    }
  }
});
