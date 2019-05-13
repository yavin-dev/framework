/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { join } from '@ember/runloop';
import { DashboardActions } from 'navi-dashboards/services/dashboard-action-dispatcher';
import Ember from 'ember';

//Used to mark the returned action as an instance of a closure action
const CLOSURE_ACTION_MODULE =
  'ember-glimmer/helpers/action' in Ember.__loader.registry
    ? Ember.__loader.require('ember-glimmer/helpers/action')
    : {};

export default Helper.extend({
  /**
   * @property {Service} dashboardActionDispatcher
   */
  dashboardActionDispatcher: service(),

  /**
   * Validates a report action and then dispatches it via the report action dispatcher
   *
   * @method dashboardAction
   * @param {Array} array with the name of the action to dispatch
   * @returns {Function} Closure action
   */
  compute([action, ...params]) {
    let actionName = DashboardActions[action];

    assert(`The action name "${action}" is not a valid dashboard action`, actionName);
    let dashboardAction = (...parameters) =>
        join(() => {
          const args = [...params, ...parameters].filter(param => !!param);
          return get(this, 'dashboardActionDispatcher').dispatch(actionName, ...args);
        }),
      actionId = CLOSURE_ACTION_MODULE.ACTION;

    //Make the report action a "real" action
    dashboardAction[actionId] = true;

    return dashboardAction;
  }
});
