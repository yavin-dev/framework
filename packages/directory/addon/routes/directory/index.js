/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';

class Index extends Route {
  /**
   * @method redirect
   * @overrride
   */
  redirect() {
    this.transitionTo('directory.my-data');
  }
}

export default Index;
