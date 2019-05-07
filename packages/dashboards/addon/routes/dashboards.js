/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';

import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  actions: {
    /**
     * @action saveDeliveryRule
     * @param {DS.Model} rule - object to save
     */
    saveDeliveryRule(rule) {
      return rule.save();
    },

    /**
     * @action revertDeliveryRule
     * @param {DS.Model} rule - object to revert
     */
    revertDeliveryRule(rule) {
      if (rule && !get(rule, 'isNew')) {
        rule.rollbackAttributes();
      }
    },

    /**
     * @action deleteDeliveryRule
     * @param {DS.Model} rule - object to delete
     */
    deleteDeliveryRule(rule) {
      rule.deleteRecord();

      return rule
        .save()
        .then(() => {
          // Make sure record is cleaned up locally
          rule.unloadRecord();

          get(this, 'naviNotifications').add({
            message: `Dashboard delivery schedule successfully removed!`,
            type: 'success',
            timeout: 'short'
          });
        })
        .catch(() => {
          // Rollback delete action
          rule.rollbackAttributes();

          get(this, 'naviNotifications').add({
            message: `OOPS! An error occurred while removing the dashboard delivery schedule.`,
            type: 'danger',
            timeout: 'short'
          });
        });
    }
  }
});
