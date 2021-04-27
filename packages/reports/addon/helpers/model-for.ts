/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import type Route from '@ember/routing/route';

export default class ModelForHelper extends Helper {
  @tracked route?: Route;
  /**
   * Returns the resolved model of a parent (or any ancestor) route
   * in a route hierarchy. If the ancestor route's model was a promise,
   * its resolved result is returned.
   */
  compute([name]: [string]) {
    const route = getOwner(this).lookup(`route:${name}`) as Route | undefined;
    if (!route) {
      return;
    }
    if (this.route) {
      this.route.controller.removeObserver('model', this, this.recompute);
    }
    this.route = route;
    route.controller.addObserver('model', this, this.recompute);
    return route.controller.model;
  }
}
