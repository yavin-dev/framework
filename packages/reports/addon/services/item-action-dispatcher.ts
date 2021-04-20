/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ActionDispatcher from 'navi-core/services/action-dispatcher';

export const ItemActions = {
  DELETE_ITEM: 'deleteItem',
};

export default class ItemActionDispatcher extends ActionDispatcher {
  get consumers() {
    return ['item'];
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'item-action-dispatcher': ItemActionDispatcher;
  }
}
