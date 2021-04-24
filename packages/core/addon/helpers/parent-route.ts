/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Returns the name of the parent to the currently visited route
 */
import CurrentRouteHelper from './current-route';

export default class ParentRouteHelper extends CurrentRouteHelper {
  /**
   * @returns name of parent to currently visited route
   */
  compute(_args?: unknown): string {
    const currentRoute = super.compute(...arguments);
    const pathElements = currentRoute.split('.');

    // Remove the leaf route
    pathElements.pop();

    return pathElements.join('.');
  }
}
