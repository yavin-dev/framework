/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import config from 'ember-get-config';

export default class TopBarComponent extends Component {
  /**
   * @property {String} loggedInUser - logged in User's id
   */
  loggedInUser = config.navi.user;
}
