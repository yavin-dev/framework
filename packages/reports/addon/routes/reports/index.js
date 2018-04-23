/**
 * Copyright 2017, Yahoo Holdings Inc.
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
  reports: computed('reports.[]', 'favorites.[]', function() {
    return DS.PromiseArray.create({
      promise: Ember.RSVP.hash({
        userReports:     get(this, 'reports'),
        favoriteReports: get(this, 'favorites')
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
    return get(this, 'user').findOrRegister().then(
      userModel => get(this, 'store').findAll('reportCollection').then(
        collections => _ReportObject.create({
          collections,
          reports: get(userModel, 'reports'),
          favorites: get(userModel, 'favoriteReports'),
          delivered: get(userModel, 'reports').filter(
            report => get(report, 'deliveryRules').then(
              rules => !Ember.isEmpty(rules)
            )
          )
        })
      )
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
     * @action buildReportUrl
     * @param {Object} report - model with id
     * @returns {String} url for given report
     */
    buildReportUrl(report) {
      let reportId = get(report, 'id'),
          baseUrl = document.location.origin,
          reportUrl = get(this, 'router').generate('reports.report', reportId);

      return baseUrl + reportUrl;
    },
  }
});
