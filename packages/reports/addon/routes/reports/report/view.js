/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { get, set, action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { merge } from 'lodash-es';
import { isForbiddenError } from 'ember-ajax/errors';
import { reject } from 'rsvp';

export default class ReportsReportViewRoute extends Route {
  /**
   * @property {Service} facts - instance of navi facts service
   */
  @service('navi-facts') facts;

  /**
   * @property {Service} naviVisualizations - instance of navi visualizations service
   */
  @service naviVisualizations;

  /**
   * @property {Object} requestOptions - options for bard request
   */
  requestOptions = {
    page: 1,
    perPage: 10000,
    clientId: 'customReports'
  };

  /**
   * @property {Object} parentModel - object containing request to view
   */
  get parentModel() {
    return this.modelFor('reports.report');
  }

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
        },
        dataSourceName: request.dataSource
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
  }

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
  }

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

    // any apex-chart will need to have the config update when the request updates,
    // but the ember-cp-validations library currently has integration bugs with ember
    // data models, so this has to be done manually (for now)
    // https://github.com/poteto/ember-changeset-validations/issues/110
    else if (visualizationModel.type.startsWith('apex-')) {
      visualizationModel.rebuildConfig(request, response);
    }
  }

  /**
   * Returns whether the current request has already run
   * @method _hasRequestRun
   * @private
   * @returns {Boolean}
   */
  _hasRequestRun() {
    return this.controllerFor(this.routeName).get('hasRequestRun');
  }

  /**
   * Runs report if it has changed
   *
   * @action runReport
   * @returns {Transition|Void} - the model refresh transition
   */
  @action
  runReport() {
    // Run the report only if there are request changes
    if (!this._hasRequestRun()) {
      return this.refresh();
    } else {
      this.send('setReportState', 'completed');
    }
  }

  /**
   * Forces the report to be rerun, used when user explicitly pushes run button.
   *
   * @action forceRun
   * @returns {Transition} - refreshes model transition
   */
  @action
  forceRun() {
    return this.refresh();
  }

  /**
   * Code to run before validating the request
   *
   * @action beforeValidate
   * @returns {Void}
   */
  @action
  beforeValidate() {
    // noop
  }

  /**
   * @action loading
   */
  @action
  loading(transition) {
    /**
     * false is sent as the first argument due to a change in router_js
     * TODO: Remove false if this is ever removed
     * https://github.com/emberjs/ember.js/issues/17545
     */
    transition.send(false, 'setReportState', 'running');
    return true; // allows the loading template to be shown
  }

  /**
   * @action error
   */
  @action
  error(error, transition) {
    /**
     * false is sent as the first argument due to a change in router_js
     * TODO: Remove false if this is ever removed
     * https://github.com/emberjs/ember.js/issues/17545
     */
    transition.send(false, 'setReportState', 'failed');
    return true; // allows the error template to be shown
  }

  /**
   * @action didTransition
   */
  @action
  didTransition() {
    this.send('setReportState', 'completed');

    return true;
  }
}
