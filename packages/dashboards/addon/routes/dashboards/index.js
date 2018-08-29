/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import DS from 'ember-data';

const { computed, get } = Ember;


/**
 * Object that computes a combined dashboard list
 * @class DashboardObject
 * @extends Ember.Object
 * @private
 */
const _DashboardObject = Ember.Object.extend({
  /**
   * @property {DS.PromiseArray} - Returns a combined dashboard list while listening to store changes
   */
  dashboards: computed('userDashboards.[]', 'favoriteDashboards.[]', function() {
    return DS.PromiseArray.create({
      promise: Ember.RSVP.hash({
        userDashboards:     get(this, 'userDashboards'),
        favoriteDashboards: get(this, 'favoriteDashboards')
      }).then(({ userDashboards, favoriteDashboards }) => {
        return Ember.A()
          .pushObjects(userDashboards.toArray())
          .pushObjects(favoriteDashboards.toArray())
          .uniq();
      })
    });
  })
});

export default Ember.Route.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: Ember.inject.service(),

  /**
   * @property {Service} user
   */
  user: Ember.inject.service(),

  /**
   * @method model
   * @override
   * @returns {Object} - with an array of dashboard models
   */
  model(){
    return get(this, 'user').findOrRegister().then(userModel => {
      return Ember.RSVP.hash({
        userDashboards:     get(userModel, 'dashboards'),
        favoriteDashboards: get(userModel, 'favoriteDashboards')
      }).then(({ userDashboards, favoriteDashboards }) => {
        return _DashboardObject.create({ userDashboards, favoriteDashboards });
      });
    });
  },

  actions: {
    /**
     * @action error
     * action to handle errors in route
     */
    error() {
      let message = 'OOPS! An error occurred while retrieving user settings. Some functionality may be limited.';
      get(this, 'naviNotifications').add({
        message: message,
        type: 'danger',
        timeout: 'short'
      });
    }
  }
});
