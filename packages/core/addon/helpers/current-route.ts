/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Returns the name of the currently visited route
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

export default class CurrentRouteHelper extends Helper {
  constructor() {
    super(...arguments);
    this.router.on('routeDidChange', () => this.recompute());
  }

  @service
  declare router: RouterService;

  /**
   * @returns name of currently visited route
   */
  compute(_args?: unknown): string | null {
    return this.router.currentRouteName;
  }
}
