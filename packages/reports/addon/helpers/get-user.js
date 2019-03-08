/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { get } from '@ember/object';

import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';

export default Helper.extend({
  /**
   * @property {Service} userService
   */
  userService: service('user'),

  /*
   * @method compute
   * @override
   */
  compute() {
    return get(this, 'userService').getUser();
  }
});
