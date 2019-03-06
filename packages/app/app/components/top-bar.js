/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import config from 'ember-get-config';

export default Component.extend({
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
