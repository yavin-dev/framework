/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Notification service
 */
import Service from '@ember/service';
import { assert } from '@ember/debug';

export default class NaviNotifications extends Service {
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
  add(/* options */) {
    assert('NaviNotifications must implement `add`');
  }

  /**
   * Clears all messages from the notification service
   *
   * @method clearMessages
   * @returns {Ember.Service} navi notification service
   */
  clearMessages() {
    assert('NaviNotifications must implement `clearMessages`');
  }
}
