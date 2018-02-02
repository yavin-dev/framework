/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#report-actions/share
 *      report=report
 *   }}
 *      Inner template
 *   {{/report-actions/share}}
 */
import Ember from 'ember';
import ReportActionBase from './base-action';
import layout from '../../templates/components/report-actions/share';

const { get, set, computed } = Ember;

export default ReportActionBase.extend({
  layout,

  /**
   * @override
   * @property {Array} classNames
   */
  classNames: ['report-control', 'share-report'],

  /**
   * @override
   * @property {Boolean} actionDisabled
   */
  actionDisabled: computed.alias('report.request.hasDirtyAttributes'),

  /**
   * @property {Boolean} showModal - flag to control modal display
   */
  showModal: false,

  /**
   * @private
   * @property {String} _appBaseUrl - Apps base url
   */
  _appBaseUrl: document.location.origin,

  /**
   * @private
   * @router {Ember.Router} _appRouter - application router
   */
  _appRouter: computed(function() {
    return this.container.lookup('router:main');
  }),

  /**
   * @property {String} reportUrl - url for given report
   */
  reportUrl: computed('report.id', function() {
    let reportId = get(this, 'report.id'),
        baseUrl = get(this, '_appBaseUrl'),
        pathToReport = get(this, '_appRouter').generate('customReports.report', reportId);

    return baseUrl + pathToReport;
  }),

  //TODO: remove once we have modal notification component
  /**
   * @property {Array} modalNotification - list of possible Modal Notification copy action
   */
  modalNotification: Ember.A([
    {
      id: 'none',
      text: 'Select the Copy Button to copy to Clipboard.',
      classNames: '',
      isRemovable : false
    },{
      id: 'success',
      text: 'Success! The Link has been copied to your clipboard',
      classNames: 'alert alert-success',
      isRemovable : true
    },{
      id: 'failure',
      text: 'Please Type ⌘-c to copy',
      classNames: 'alert alert-info',
      isRemovable : true
    }
  ]),

  //TODO: remove once we have modal notification component
  /**
   * @property {Object} modalNotificationType- By default it will be the first object: 'none'
   */
  modalNotificationType: Ember.computed.oneWay('modalNotification.firstObject'),

  //TODO: remove once we have modal notification component
  /**
   * Sets the notification to the desired ID
   *
   * @method setModalNotification
   * @param {notificationId} String - string id to use
   */
  setNotificationType(notificationId) {
    let modalNotificationSelection = get(this, 'modalNotification'),
        modalNotificationFind = modalNotificationSelection.findBy('id', notificationId);
    set(this, 'modalNotificationType', modalNotificationFind);
  },

  /**
   * @property {String} reportName - report name/title
   */
  reportName: computed('report.title', function() {
    let reportName = get(this, 'report.title');
    if (reportName.length > 30) {
      return reportName.substring(0, 30) + '...';
    }
    return reportName;
  }),

  /**
   * @event click - component's Click event
   */
  click() {
    if(!get(this, 'actionDisabled')) {
      set(this, 'showModal', true);
    }
  },

  actions: {

    /**
     * @action cancel - action triggered on clicking modal's cancel button
     */
    cancel() {
      set(this, 'showModal', false);
    },

    //TODO: refactor once we have modal notification component
    /**
     * Notification when the copy URL action is a success
     */
    copyURLSuccess() {
      this.setNotificationType('success');
    },

    //TODO: refactor once we have modal notification component
    /**
     * Notification when the copy URL action is has an error
     */
    copyURLFailure() {
      this.setNotificationType('failure');
    },

    //TODO: refactor once we have modal notification component
    /**
     * Close of modal notification, this will result in clearing all notifications
     */
    closeModalNotification() {
      this.setNotificationType('none');
    }
  }
});
