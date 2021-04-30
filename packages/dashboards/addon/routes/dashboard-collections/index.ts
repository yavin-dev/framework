/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';

export default class DashboardCollectionsIndexRoute extends Route {
  /**
   * @returns an array of dashboard Collection models
   */
  model() {
    return this.store.findAll('dashboard-collection');
  }
}
