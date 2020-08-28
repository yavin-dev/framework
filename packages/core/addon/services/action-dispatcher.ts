/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to dispatch an action to one or more registered consumers
 */

import Service from '@ember/service';
import { getOwner } from '@ember/application';
import ActionConsumer from 'navi-core/consumers/action-consumer';

export default class ActionDispatcher extends Service {
  /**
   * List of consumers to be registered on init
   */
  consumers: string[] = [];

  /**
   * List of registered consumers instances
   */
  _registeredConsumers: ActionConsumer[] = [];

  init() {
    super.init();
    this.consumers.forEach(consumer => this.registerConsumer(consumer));
  }

  /**
   * Registers a consumer object with the dispatcher service
   */
  registerConsumer(consumerName: string) {
    const owner = getOwner(this);
    this._registeredConsumers.push(owner.lookup(`consumer:${consumerName}`));
  }

  /**
   * Dispatches an action to all of the consumers
   */
  dispatch(actionType: string, ...params: unknown[]) {
    this._registeredConsumers.forEach(consumer => consumer.send(actionType, ...params));
  }
}
