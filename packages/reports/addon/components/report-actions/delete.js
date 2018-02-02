/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#report-actions/delete
 *      report=report
 *   }}
 *      Inner template
 *   {{/report-actions/delete}}
 */

import Ember from 'ember';
import layout from '../../templates/components/report-actions/delete';
import ReportActionBase from './base-action';

const { computed, get, set } = Ember;

export default ReportActionBase.extend({
  layout,

  /**
   * @property {Boolean} showModal - flag to control modal display
   */
  showModal: false,

  /**
   * @override
   * @property {Boolean} checkPermission - if true permission check is performed
   */
  checkPermission: true,

  /**
   * @property {Ember.RSVP} _deletePromise - delete promise
   */
  _deletePromise: undefined,

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
   * @property {Boolean} isDeleting - Boolean to indicate if delete is in progress
   */
  isDeleting: computed.bool('_deletePromise'),

  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: Ember.inject.service(),

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
     * @action delete - action triggered on clicking modal's confirm button
     */
    delete() {
      let report = get(this, 'report'),
          reportName = get(this, 'reportName'),
          notificationMsgType = 'success',
          notificationMsg = `Report "${reportName}" deleted successfully!`;

      report.deleteRecord();

      let deletePromise = report.save().then(() => {
        //Make sure record is cleaned up locally
        report.destroy();
        this.get('_router').transitionTo('customReports');
      }).catch(() => {

        //rollback delete action
        report.rollbackAttributes();

        //set error notification
        notificationMsgType = 'danger';
        notificationMsg = `OOPS! an error occurred while deleting report "${reportName}"`;
      }).finally(() => {

        if(!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
          //close modal
          set(this, 'showModal', false);

          //clear delete promise
          set(this, '_deletePromise', undefined);
        }

        //show notification msg
        get(this, 'naviNotifications').add({
          message: notificationMsg,
          type: notificationMsgType,
          timeout: 'short'
        });
      });

      set(this, '_deletePromise', deletePromise);
    },

    /**
     * @action cancel - action triggered on clicking modal's cancel button
     */
    cancel() {
      set(this, 'showModal', false);
    }
  }
});
