/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';

export default class OtherData extends Route {
  /**
   * @method model
   * @override
   */
  model() {
    //returning an object so that the table can handle the promise
    return {
      items: []
    };
  }
}
