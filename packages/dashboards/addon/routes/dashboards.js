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
     * @action deleteDashboard
     */
    deleteDashboard(dashboard){
      let dashboardName = get(dashboard, 'title');

      dashboard.deleteRecord();
      return dashboard.save().then(() => {
        //Make sure record is cleaned up locally
        dashboard.unloadRecord();
        this.transitionTo('dashboards');

        get(this, 'naviNotifications').add({
          message: `Dashboard "${dashboardName}" deleted successfully!`,
          type: 'success',
          timeout: 'short'
        });

      }).catch(() => {
        //rollback delete action
        dashboard.rollbackAttributes();

        get(this, 'naviNotifications').add({
          message: `OOPS! An error occurred while deleting dashboard "${dashboardName}"`,
          type: 'danger',
          timeout: 'medium'
        });
      });
    }
  }
});
