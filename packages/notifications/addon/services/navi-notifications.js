/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Notification service
 */
import Service, { inject as service } from '@ember/service';

const TIMEOUTS = {
  short: 3000,
  medium: 10000,
  long: 50000
};

export default class NaviNotifications extends Service {
  @service('flash-messages')
  notificationService;

  /**
   * Calls the add notification method of notification service
   *
   * @method add
   * @param {Object} options
   * @param {String} options.message - Required. The message that the flash message displays.
   * @param {String} [options.type] - The flash message's type is set as a class name on the rendered component.
   * @param {String} [options.timeout] - Key into navi.notifications config
   * @param {Boolean} [options.sticky] - By default, flash messages disappear after a certain amount of time.
   *                                   To disable this and make flash messages permanent (they can still
   *                                   be dismissed by click), set sticky to true.
   * @returns {Ember.Service} notification service
   */
  add(options = {}) {
    const { notificationService } = this;

    //Check if message already is present
    if (notificationService && notificationService.queue.mapBy('message').includes(options.message)) {
      return notificationService;
    } else {
      options.timeout = TIMEOUTS[options.timeout];
      return notificationService.add(options);
    }
  }

  /**
   * Clears all messages from the notification service
   *
   * @method clearMessages
   * @returns {Ember.Service} navi notification service
   */
  clearMessages() {
    return this.notificationService.clearMessages();
  }
}
