/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Notification service meant to be a single place for
 * a parent app to receive and respond to notifications
 */
import Service from '@ember/service';

export default Service.extend({
  /**
   * @method add
   * @param {Object} options
   * @param {String} options.message - Required. The message that the flash message displays.
   * @param {String} [options.type] - The flash message's type is set as a class name on the rendered component.
   * @param {String} [options.timeout] - Key into navi.notifications config
   * @param {Boolean} [options.sticky] - By default, flash messages disappear after a certain amount of time.
   *                                   To disable this and make flash messages permanent (they can still
   *                                   be dismissed by click), set sticky to true.
   * @returns {Ember.Service} navi notification service
   */
  add(/* options */) {
    return this;
  },

  /**
   * @method clearMessages
   * @returns {Ember.Service} navi notification service
   */
  clearMessages() {
    return this;
  }
});
