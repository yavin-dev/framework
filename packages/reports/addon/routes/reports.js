/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

const { get } = Ember;

export default Ember.Route.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: Ember.inject.service(),

  actions: {
    /**
     * @action saveDeliveryRule
     * @param {DS.Model} rule - object to save
     */
    saveDeliveryRule(rule) {
      return rule.save().then(() => {
        get(this, 'naviNotifications').add({
          message: 'Report delivery schedule successfully saved!',
          type: 'success',
          timeout: 'short'
        });
      }).catch(() => {
        get(this, 'naviNotifications').add({
          message: 'OOPS! An error occurred while scheduling your report',
          type: 'danger',
          timeout: 'medium'
        });
      });
    },

    /**
     * @action revertDeliveryRule
     * @param {DS.Model} rule - object to revert
     */
    revertDeliveryRule(rule) {
      if(rule && !get(rule, 'isNew')){
        rule.rollbackAttributes();
      }
    },

    /**
     * @action deleteDeliveryRule
     * @param {DS.Model} rule - object to delete
     */
    deleteDeliveryRule(rule) {
      rule.deleteRecord();

      return rule.save().then(() => {
        // Make sure record is cleaned up locally
        rule.unloadRecord();

        get(this, 'naviNotifications').add({
          message: `Report delivery schedule successfully removed!`,
          type: 'success',
          timeout: 'short'
        });
      }).catch(() => {
        // Rollback delete action
        rule.rollbackAttributes();

        get(this, 'naviNotifications').add({
          message: `OOPS! An error occurred while removing the report delivery schedule.`,
          type: 'danger',
          timeout: 'short'
        });
      });
    },

    /**
     * @action deleteReport
     * @param {DS.Model} report - object to delete
     */
    deleteReport(report) {
      let reportName = get(report, 'title');

      report.deleteRecord();

      return report.save().then(() => {
        // Make sure record is cleaned up locally
        report.unloadRecord();

        get(this, 'naviNotifications').add({
          message: `Report "${reportName}" deleted successfully!`,
          type: 'success',
          timeout: 'short'
        });

        this.transitionTo('reports');
      }).catch(() => {

        // Rollback delete action
        report.rollbackAttributes();

        get(this, 'naviNotifications').add({
          message: `OOPS! An error occurred while deleting report "${reportName}"`,
          type: 'danger',
          timeout: 'short'
        });
      });
    },
  }
});
