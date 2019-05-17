/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { A } from '@ember/array';
import { hash } from 'rsvp';
import EmberObject, { get, computed } from '@ember/object';
import DS from 'ember-data';

/**
 * Object that computes a combined dashboard list
 * @class DashboardObject
 * @extends Ember.Object
 * @private
 */
const _DashboardObject = EmberObject.extend({
  /**
   * @property {DS.PromiseArray} - Returns a combined dashboard list while listening to store changes
   */
  dashboards: computed('userDashboards.[]', 'favoriteDashboards.[]', function() {
    return DS.PromiseArray.create({
      promise: hash({
        userDashboards: get(this, 'userDashboards'),
        favoriteDashboards: get(this, 'favoriteDashboards')
      }).then(({ userDashboards, favoriteDashboards }) => {
        return A()
          .pushObjects(userDashboards.toArray())
          .pushObjects(favoriteDashboards.toArray())
          .uniq();
      })
    });
  })
});

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
   * @method model
   * @override
   * @returns {Object} - with an array of dashboard models
   */
  model() {
    return get(this, 'user')
      .findOrRegister()
      .then(userModel => {
        return hash({
          userDashboards: get(userModel, 'dashboards'),
          favoriteDashboards: get(userModel, 'favoriteDashboards')
        }).then(({ userDashboards, favoriteDashboards }) => {
          return _DashboardObject.create({
            userDashboards,
            favoriteDashboards
          });
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
