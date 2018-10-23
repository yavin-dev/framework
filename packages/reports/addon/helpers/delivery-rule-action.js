/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { join } from '@ember/runloop';
import { DeliveryRuleActions } from 'navi-reports/services/delivery-rule-action-dispatcher';
import Ember from 'ember';

//Used to mark the returned action as an instance of a closure action
const CLOSURE_ACTION_MODULE =
  'ember-glimmer/helpers/action' in Ember.__loader.registry
    ? Ember.__loader.require('ember-glimmer/helpers/action')
    : {};

export default Helper.extend({
  /**
   * @property {Service} deliveryRuleActionDispatcher
   */
  deliveryRuleActionDispatcher: service(),

  /**
   * Validates a delivery-rule action and then dispatches it via the delivery-rule action dispatcher
   *
   * @method deliveryRuleAction
   * @param {Array} array with the name of the action to dispatch
   * @returns {Function} Closure action
   */
  compute([action, ...params]) {
    let actionName = DeliveryRuleActions[action];
    assert(`The action name "${action}" is not a valid delivery rule action`, actionName);
    let deliveryRuleAction = (...parameters) =>
        join(() => get(this, 'deliveryRuleActionDispatcher').dispatch(actionName, ...params, ...parameters)),
      actionId = CLOSURE_ACTION_MODULE.ACTION;

    //Make the delivery-rule action a "real" action
    deliveryRuleAction[actionId] = true;

    return deliveryRuleAction;
  }
});
