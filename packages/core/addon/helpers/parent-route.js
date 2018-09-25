/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Returns the name of the parent to the currently visited route
 */
import CurrentRoute from './current-route';

export default CurrentRoute.extend({
  /**
   * @method compute
   * @override
   * @returns {String} name of parent to currently visited route
   */
  compute() {
    let current = this._super(),
      pathElements = current.split('.');

    // Remove the leaf route
    pathElements.pop();

    return pathElements.join('.');
  }
});
