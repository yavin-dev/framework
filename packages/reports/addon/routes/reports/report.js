/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import merge from 'lodash/merge';
import { get, set, computed } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A as arr } from '@ember/array';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';

export default Route.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * @property {Service} user
   */
  user: service(),

  /**
   * @property {Service} naviVisualizations
   */
  naviVisualizations: service(),

  /**
   * @property {Service} updateReportActionDispatcher
   */
  updateReportActionDispatcher: service(),

  /**
   * @property {String} defaultVisualizationType - visualization type if not
   *                                               specified in report
   */
  defaultVisualizationType: computed(function() {
    return get(this, 'naviVisualizations').defaultVisualization();
  }),

  /**
   * @method model
   * @param {Object} params
   * @param {String} params.reportId - persisted id or temp id of report to fetch
   * @returns {DS.Model|Promise} model for requested report
   */
  model({ report_id }) {
    return get(this, 'user')
      .findOrRegister()
      .then(() => this._findByTempId(report_id) || this.store.findRecord('report', report_id))
      .then(this._defaultVisualization.bind(this));
  },

  /**
   * @method afterModel
   * @param {DS.Model} report - resolved report model
   * @override
   */
  afterModel(report) {
    if (get(report, 'isNew') && get(report, 'request.validations.isInvalid')) {
      return this.replaceWith(`${this.routeName}.edit`, get(report, 'tempId'));
    }

    if (get(report, 'request.validations.isInvalid')) {
      return this.replaceWith(`${this.routeName}.invalid`, get(report, 'tempId') || get(report, 'id'));
    }
  },

  /**
   * @param {Controller} controller
   * @override
   */
  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({
      showSaveAs: false,
      isFiltersCollapsed: false,
      modifiedRequest: null
    });
  },

  /**
   * @method _findByTempId
   * @private
   * @param {String} id - temp id of local report
   * @returns {DS.Model} report with matching temp id
   *
   */
  _findByTempId(id) {
    return arr(this.store.peekAll('report')).findBy('tempId', id);
  },

  /**
   * Sets default visualization if required
   *
   * @method _defaultVisualization
   * @private
   * @param {DS.Model} report - report model
   * @returns {DS.Model} report with update visualization if required
   *
   */
  _defaultVisualization(report) {
    if (!get(report, 'visualization.type')) {
      set(report, 'visualization', this.store.createFragment(get(this, 'defaultVisualizationType'), {}));
    }
    return report;
  },

  /**
   * Rolling back dirty attributes on transition
   * @method deactivate
   * @override
   */
  deactivate() {
    let model = this.currentModel;
    // https://github.com/emberjs/ember.js/issues/16820
    if (!this.isDestroying && !get(model, 'isNew') && get(model, 'hasDirtyAttributes')) {
      this.send('revertChanges', model);
    }
  },

  actions: {
    /**
     * @action runReport
     * transition to view subroute if runReport is not handled in subroutes
     */
    runReport(report) {
      this.transitionTo(`${this.routeName}.view`, get(report, 'tempId') || get(report, 'id'));
    },

    /**
     * @action forceRun
     * transition to view subroute since the running is not handled here.
     * @see routes.reports.report.view.actions.forceRun
     */
    forceRun(report) {
      this.send('runReport', report);
    },

    /**
     * @action cancelReport
     * transition to edit subroute
     */
    cancelReport(report) {
      this.transitionTo(`${this.routeName}.edit`, get(report, 'tempId') || get(report, 'id'));
    },

    /**
     * @action validate
     * @param {Object} request - object to validate
     * @returns {Promise} promise that resolves or rejects based on validation status
     */
    validate(report) {
      return get(report, 'request')
        .validate()
        .then(({ validations }) => {
          if (get(validations, 'isInvalid')) {
            // Transition to invalid route to show user validation errors
            return this.transitionTo(`${this.routeName}.invalid`, get(report, 'tempId') || get(report, 'id')).then(() =>
              RSVP.reject()
            );
          }

          return RSVP.resolve();
        });
    },

    /**
     * @action revertChanges
     * @param {Object} report - object to rollback
     */
    revertChanges(report) {
      report.rollbackAttributes();
    },

    /**
     * @action saveReport
     * @param {DS.Model} report - object to save
     */
    saveReport(report) {
      report
        .save()
        .then(() => {
          get(this, 'naviNotifications').add({
            message: 'Report was successfully saved!',
            type: 'success',
            timeout: 'short'
          });

          // Switch from temp id to permanent id
          this.replaceWith('reports.report.view', get(report, 'id'));
        })
        .catch(() => {
          get(this, 'naviNotifications').add({
            message: 'OOPS! An error occurred while saving the report',
            type: 'danger',
            timeout: 'medium'
          });
        });
    },

    /**
     * @action updateTitle
     *
     * Updates report model's title, unless new title is empty
     * @param {String} title
     */
    updateTitle(title) {
      if (!isEmpty(title)) {
        set(this.currentModel, 'title', title);
      }
    },

    /*
     * @action setReportState
     * @param {String} state
     */
    setReportState(state) {
      const controller = this.controllerFor(this.routeName);
      controller.set('reportState', state);
    },

    /*
     * @action setModifiedRequest
     * @param {Object} request
     */
    setModifiedRequest(request) {
      const controller = this.controllerFor(this.routeName);
      controller.set('modifiedRequest', request);
    },

    /**
     * @action onUpdateVisualizationConfig
     *
     * Update visualization metadata in report
     * @param {Object} metadataUpdates
     */
    onUpdateVisualizationConfig(metadataUpdates) {
      let metadata = get(this, 'currentModel.visualization.metadata');

      set(this.currentModel, 'visualization.metadata', merge({}, metadata, metadataUpdates));
    },

    /**
     * @action onUpdateReport
     */
    onUpdateReport(actionType, ...args) {
      /*
       * Whenever the request updates, disable the add to dashboard button until the user runs the request
       * This prevents the user from adding an invalid report/visualization to a dashboard
       */
      this.send('setReportState', 'editing');

      /*
       *dispatch action if arguments are passed through
       *TODO validate actionType is a valid report action
       */
      if (actionType) {
        get(this, 'updateReportActionDispatcher').dispatch(actionType, this, ...args);
      }

      this.send('setModifiedRequest', this.currentModel.get('request').serialize());
    },

    /**
     * @action toggleFavorite - toggles favorite model
     */
    toggleFavorite(report) {
      let user = get(this, 'user').getUser(),
        isFavorite = get(report, 'isFavorite'),
        updateOperation = isFavorite ? 'removeObject' : 'addObject',
        rollbackOperation = isFavorite ? 'addObject' : 'removeObject';

      get(user, 'favoriteReports')[updateOperation](report);
      user.save().catch(() => {
        //manually rollback - fix once ember-data has a way to rollback relationships
        get(user, 'favoriteReports')[rollbackOperation](report);
        get(this, 'naviNotifications').add({
          message: 'OOPS! An error occurred while updating favorite reports',
          type: 'danger',
          timeout: 'medium'
        });
      });
    }
  }
});
