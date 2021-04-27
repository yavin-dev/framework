/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Returns the name of a sibling to the currently visited route
 */
import ParentRouteHelper from './parent-route';

export default class SiblingRouteHelper extends ParentRouteHelper {
  /**
   * @returns name of sibling to currently visited route
   */
  compute([siblingName]: [string]): string {
    const parent = super.compute(...arguments);

    return `${parent}.${siblingName}`;
  }
}
