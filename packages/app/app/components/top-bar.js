/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import config from 'ember-get-config';

const { computed } = Ember;

export default Ember.Component.extend({

  /**
    * @property {Array} classNames
    */
  classNames: ['top-bar'],

  /**
    * @property {String} loggedInUser - logged in User's id
    */
  loggedInUser: computed(function() {
    return config.navi.user;
  })
});
