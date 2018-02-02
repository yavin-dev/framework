/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import config from 'ember-get-config';

const { get, inject } = Ember;
const NOT_FOUND = '404';

export default Ember.Service.extend({

  /**
   * @property {Ember.Service} store
   */
  store: inject.service(),

  /**
   * Gets user model given user ID without triggering a fetch, if  user ID not specified gets logged-in user
   *
   * @method getUser
   * @param {String} [userId] - user ID
   * @returns {DS.Model} - user model, if not found returns null
   */
  getUser(userId = config.navi.user) {
    return get(this, 'store').peekRecord('user', userId);
  },

  /**
   * Finds user given user ID, if user ID not specified gets logged-in user
   *
   * @method find
   * @param {String} [userId] - user ID
   * @returns {Promise} - Promise containing user model
   */
  findUser(userId = config.navi.user) {
    return get(this, 'store').findRecord('user', userId);
  },

  /**
   * Registers logged-in user
   *
   * @method register
   * @returns {Promise} - Promise containing logged-in user model
   */
  register() {
    let userId = config.navi.user,
        userModel = get(this, 'store').createRecord('user', {id: userId});

    return userModel.save();
  },

  /**
   * Finds logged-in user, if not present registers user
   *
   * @method findOrRegister
   * @returns {Promise} - Promise containing logged-in user model
   */
  findOrRegister() {
    return this.findUser().catch(serverError => {
      if (serverError.errors[0].status === NOT_FOUND) {
        return this.register();
      }

      //reject promise
      throw serverError;
    });
  }
});
