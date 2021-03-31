/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';

export const DeliveryRuleActions = <const>{
  DELETE_DELIVERY_RULE: 'deleteDeliveryRule',
  REVERT_DELIVERY_RULE: 'revertDeliveryRule',
  SAVE_DELIVERY_RULE: 'saveDeliveryRule',
};

export default class DeliveryRuleActionDispatcher extends ActionDispatcher {
  get consumers() {
    return ['delivery-rule'];
  }
}
