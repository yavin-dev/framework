/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#report-actions/save
 *      report=report
 *   }}
 *      Inner template
 *   {{/report-actions/save}}
 */
import Ember from 'ember';
import layout from '../../templates/components/report-actions/save';

const { get, set, assert, computed, isEmpty } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['save-report'],

  /**
   * @property {DS.Model} model - custom report/request model
   */
  report: undefined,

  /**
   * @property {DS.Model.Fragment} request - bard-request/request model fragment
   */
  request: computed.alias('report.request'),

  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: Ember.inject.service(),

  /**
   * @method init
   * @override
   */
  init() {
    this._super(...arguments);

    assert('report property must be of model type report',
      get(this, 'report.constructor.modelName') === 'report');
  },

  /**
   * @property {Boolean} showModal - boolean to control modal display
   */
  showModal: false,

  /**
   * @property {String} mode - property to indicate mode of component i.e. "input" or "saving"
   */
  mode: 'input',

  /**
   * @property {String} reportName - report name
   */
  reportName: computed.alias('report.title'),

  /**
   * @private
   * @property {Router} _router - application router
   *
   * TODO: remove after we have a routing service
   */
  _router: computed(function() {
    return this.container.lookup('router:main');
  }),

  /**
   * @property {Boolean} disableSave - flag to indicate if save button is disabled
   */
  disableSave: computed('reportName', 'mode', function() {
    if(get(this, 'mode') === 'input'){
      return isEmpty(get(this, 'reportName'));
    }
    return true;
  }),

  /**
   * @property {Boolean} isVisible - flag to indicate if the component should be visible
   */
  isVisible: computed.alias('report.request.hasDirtyAttributes'),

  /**
   * @property {Boolean} disableCancel - flag to indicate if cancel button is disabled
   */
  disableCancel: computed.equal('mode', 'saving'),

  /**
   * @property {Number} charLimit - Report Name's max length
   */
  charLimit: 150,

  /**
   * @property {Number} charsLeft - characters left to reach report name's max length
   */
  charsLeft: computed('reportName', 'charLimit', function() {
    return get(this, 'charLimit') - get(this, 'reportName').length;
  }),

  /**
   * Method called when report is saved successfully
   *
   * @private
   * @method _onSaveSuccess
   * @returns {Void}
   */
  _onSaveSuccess() {
    // Show success notification
    get(this, 'naviNotifications').add({
      message: 'Report was successfully saved!',
      type: 'success',
      timeout: 'medium'
    });

    // Close modal
    set(this, 'showModal', false);

    /*
     * TODO: replace with routing service
     * Transition to customReports/:id route
     */
    this.get('_router').transitionTo('customReports.report', get(this, 'report.id'));
  },

  /**
   * Method called when a failure occurs while saving the report
   *
   * @private
   * @method _onSaveFailure
   * @returns {Void}
   */
  _onSaveFailure() {
    // Show error notification
    get(this, 'naviNotifications').add({
      message: 'OOPS! An error occurred while saving the report',
      type: 'danger',
      timeout: 'medium'
    });

    // Close modal
    set(this, 'showModal', false);
    // reset mode
    set(this, 'mode', 'input');
  },

  /**
   * Throws notification on validation error
   *
   * @private
   * @method _onValidationError
   * @returns {void}
   */
  _onValidationError() {
    get(this, 'naviNotifications').add({
      message: 'OOPS! There is an problem with your request. Please fix all errors before saving.',
      type: 'danger',
      timeout: 'long'
    });
  },

  /**
   * @action saveReport - validates request and displays save modal if valid
   */
  click() {
    get(this, 'request').validate().then(({validations}) => {
      this.sendAction('setRequestValidityStatus', get(this, 'request.validations.isValid'));
      if(!validations.get('isValid')) {
        this._onValidationError();
        return;
      }
      // Show modal only for an unsaved report
      if(get(this, 'report.isNew')) {
        set(this, 'showModal', true);
      }
      else {
        this.send('save');
      }
    });
  },

  actions: {

    /**
     * @action onEnter - triggers save if enabled
     */
    onEnter() {
      if (!get(this, 'disableSave')) {
        this.send('save');
      }
    },

    /**
     * @action save - action triggered on clicking save report button
     */
    save() {
      set(this, 'mode', 'saving');

      //set title as report name
      set(this, 'report.title', get(this, 'reportName'));

      // Save report
      get(this, 'report').save().then(() => {
        this._onSaveSuccess();
      }).catch(() => {
        this._onSaveFailure();
      });
    },

    /**
     * @action cancel - action triggered on clicking cancel button
     */
    cancel() {
      set(this, 'showModal', false);
    }
  }
});
