/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';
import { computed } from '@ember/object';

export const DeliveryRuleActions = Object.assign(
  {},
  {
    DELETE_DELIVERY_RULE: 'deleteDeliveryRule',
    REVERT_DELIVERY_RULE: 'revertDeliveryRule',
    SAVE_DELIVERY_RULE: 'saveDeliveryRule'
  }
);

export default ActionDispatcher.extend({
  /**
   * @property {Array} consumers
   */
  consumers: computed(() => ['delivery-rule'])
});
