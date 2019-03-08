/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { oneWay } from '@ember/object/computed';

import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { set, observer, get } from '@ember/object';

export default Helper.extend({
  /**
   * @property {*} content - model of route
   */
  content: oneWay('route.controller.model'),

  /**
   * Returns the resolved model of a parent (or any ancestor) route
   * in a route hierarchy. If the ancestor route's model was a promise,
   * its resolved result is returned.
   *
   * @method modelFor
   * @param {Array} array with the name of the route
   * @return {Object} the model object
   */
  compute([name]) {
    let route = getOwner(this).lookup(`route:${name}`);
    set(this, 'route', route);
    return get(this, 'content');
  },

  /**
   * Observer that recomputes the value when route model changes
   * @method contentDidChange
   * @returns {Void}
   */
  contentDidChange: observer('content', function() {
    this.recompute();
  })
});
