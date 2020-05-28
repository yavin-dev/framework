/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class Admin extends Route {
  /**
   * @property { Service } user
   */
  @service user: TODO;

  /**
   * @method model
   * @override
   */
  model() {
    return this.user.getUser();
  }
}
