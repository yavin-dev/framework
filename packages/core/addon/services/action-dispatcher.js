/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to dispatch an action to one or more registered consumers
 */

import Ember from 'ember';

const { get, getOwner, getWithDefault, set } = Ember;

export default Ember.Service.extend({
  /**
   * @property {Array} consumers - list of consumers to be registered on init
   */
  consumers: undefined,

  /**
   * @property {Array} _registeredConsumers - list of registered consumers instances
   */
  _registeredConsumers: undefined,

  /**
   * Initializes service on creation
   *
   * @method init
   * @returns {Void}
   */
  init() {
    this._super(...arguments);
    set(this, '_registeredConsumers', []);
    getWithDefault(this, 'consumers', []).forEach(consumer =>
      this.registerConsumer(consumer)
    );
  },

  /**
   * Registers a consumer object with the dispatcher service
   *
   * @method registerConsumer
   * @param {String} consumer - fullName of consumer
   * @returns {Void}
   */
  registerConsumer(consumer) {
    get(this, '_registeredConsumers').push(
      getOwner(this).lookup(`consumer:${consumer}`)
    );
  },

  /**
   * Dispatches an action to all of the consumers
   *
   * @method dispatch
   * @param {String} actionType - action type name
   * @param {...*} args - arguments passed to the consumer
   * @returns {Void}
   */
  dispatch(actionType, ...params) {
    get(this, '_registeredConsumers').forEach(consumer =>
      consumer.send(actionType, ...params)
    );
  }
});
