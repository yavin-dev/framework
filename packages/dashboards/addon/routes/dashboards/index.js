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
  dashboards: computed('dashboards.[]', 'favorites.[]', function() {
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
    return get(this, 'user').findOrRegister().then(
      userModel => Ember.RSVP.hash({
        collections: get(this, 'store').findAll('dashboardCollection'),
        dashboards: get(userModel, 'dashboards'),
        favorites: get(userModel, 'favoriteDashboards')
      }).then(({ collections, dashboards, favorites }) => {
        return _DashboardObject.create({ collections, dashboards, favorites });
      })
    );
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
    },

    /**
     * @action buildDashboardUrl
     * @param {Object} dashboard - model with id
     * @returns {String} url for given dashboard
     */
    buildDashboardUrl(dashboard) {
      let dashboardId = get(dashboard, 'id'),
          baseUrl = document.location.origin,
          dashboardUrl = get(this, 'router').generate('dashboards.dashboard', dashboardId);

      return baseUrl + dashboardUrl;
    }
  }
});
