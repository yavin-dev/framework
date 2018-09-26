/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';

export const ItemActions = Object.assign(
  {},
  {
    DELETE_ITEM: 'deleteItem'
  }
);

export default ActionDispatcher.extend({
  /**
   * @property {Array} consumers
   */
  consumers: ['item']
});
