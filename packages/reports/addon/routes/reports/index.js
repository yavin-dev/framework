/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import DS from 'ember-data';

const { computed, get } = Ember;

/**
 * Object that computes a combined report list
 * @class ReportObject
 * @extends Ember.Object
 * @private
 */
const _ReportObject = Ember.Object.extend({
  /**
   * @property {DS.PromiseArray} - Returns a combined report list while listening to store changes
   */
  reports: computed('userReports.[]', 'favoriteReports.[]', function() {
    return DS.PromiseArray.create({
      promise: Ember.RSVP.hash({
        userReports:     get(this, 'userReports'),
        favoriteReports: get(this, 'favoriteReports')
      }).then(({ userReports, favoriteReports }) => {
        return Ember.A()
          .pushObjects(userReports.toArray())
          .pushObjects(favoriteReports.toArray())
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
   * Sets the model for this route
   *
   * @method model
   * @override
   * @returns {Object} contains an array of report models
   */
  model() {
    return get(this, 'user').findOrRegister().then(userModel => {
      return _ReportObject.create({
        userReports: get(userModel, 'reports'),
        favoriteReports: get(userModel, 'favoriteReports')
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
