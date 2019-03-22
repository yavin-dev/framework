/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { registerAsyncHelper } from '@ember/test';
import { Promise } from 'rsvp';

/**
 * Helper to wait for element to be loaded
 *
 * @param {String} selector - element selector
 * @param {Number} [timeout] - wait timeout in milliseconds
 * @returns {Promise} - Promise that will resolve when element is found, or reject if timed-out
 */

export default registerAsyncHelper('waitForElement', function(app, selector, timeout = 3000) {
  return new Promise(function(resolve /*, reject */) {
    let interval, timer, found;

    //Poll for selector
    interval = setInterval(() => {
      if (find(selector).length) {
        found = true;
        clearInterval(interval);
        clearTimeout(timer);
        resolve();
      }
    }, 50);

    //If not found in timeout, reject promise
    timer = setTimeout(function() {
      if (!found) {
        clearInterval(interval);
        throw new Error(`Could not find ${selector} in the timeout ${timeout}ms`);
      }
    }, timeout);
  });
});
