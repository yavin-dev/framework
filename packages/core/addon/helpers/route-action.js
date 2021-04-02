/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Code adapted from https://github.com/DockYard/ember-route-action-helper and modified to work with Ember 3.10 and over
 */
import Ember from 'ember';
import { A as emberArray } from '@ember/array';
import Helper from '@ember/component/helper';
import { get, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { runInDebug, assert } from '@ember/debug';
import { inject as service } from '@ember/service';

let ClosureActionModule;
if ('ember-glimmer/helpers/action' in Ember.__loader.registry) {
  ClosureActionModule = Ember.__loader.require('ember-glimmer/helpers/action');
} else if ('ember-htmlbars/keywords/closure-action' in Ember.__loader.registry) {
  ClosureActionModule = Ember.__loader.require('ember-htmlbars/keywords/closure-action');
} else if ('ember-routing-htmlbars/keywords/closure-action' in Ember.__loader.registry) {
  ClosureActionModule = Ember.__loader.require('ember-routing-htmlbars/keywords/closure-action');
} else {
  ClosureActionModule = {};
}

const ACTION = ClosureActionModule.ACTION;

function getCurrentInfos(router, routerService) {
  let routerLib = get(routerService, '_router._routerMicroLib') || router._routerMicrolib || router.router;

  return {
    currentInfos: routerLib.currentRouteInfos || routerLib.currentHandlerInfos,
    mapBy: (routerLib.currentRouteInfos && 'route') || 'handler',
  };
}

function getRoutes(router, routerService) {
  const { currentInfos, mapBy } = getCurrentInfos(router, routerService);
  return emberArray(currentInfos).mapBy(mapBy).reverse();
}

function getRouteWithAction(router, routerService, actionName) {
  let action;
  let handler = emberArray(getRoutes(router, routerService)).find((route) => {
    let actions = route.actions || route._actions;
    action = actions[actionName];

    return typeof action === 'function';
  });

  return { action, handler };
}

export default class RouteActionHelper extends Helper {
  @computed
  get router() {
    // TODO: Update to using routerService only
    return getOwner(this).lookup('router:main');
  }

  @service('router') routerService;

  compute([actionName, ...params]) {
    let router = this.router,
      routerService = this.routerService;

    runInDebug(() => {
      let { handler } = getRouteWithAction(router, routerService, actionName);
      assert(`[route-action-helper] Unable to find action ${actionName}`, handler);
    });

    let routeAction = function (...invocationArgs) {
      let { action, handler } = getRouteWithAction(router, routerService, actionName);
      let args = params.concat(invocationArgs);
      return run.join(handler, action, ...args);
    };

    routeAction[ACTION] = true;

    return routeAction;
  }
}
