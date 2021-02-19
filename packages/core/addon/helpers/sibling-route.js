/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Returns the name of a sibling to the currently visited route
 */
import ParentRoute from './parent-route';

export default ParentRoute.extend({
  /**
   * @method compute
   * @override
   * @param {String} siblingName
   * @returns {String} name of sibling to currently visited route
   */
  compute([siblingName]) {
    let parent = this._super();

    return `${parent}.${siblingName}`;
  },
});
