/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { registerHelper } from '@ember/test';
import { run } from '@ember/runloop';

/**
 * Test helper to visit a route without waiting
 * Ref: https://github.com/emberjs/ember.js/blob/v3.7.3/packages/ember-testing/lib/helpers/visit.js#L21
 *
 * @method visitWithoutWait
 * @param {Ember Application} app
 * @param {String} url - URL to visit
 * @return {Void}
 */
export default registerHelper('visitWithoutWait', function(app, url) {
  let router = app.__container__.lookup('router:main');
  let shouldHandleURL = false;

  app.boot().then(() => {
    router.location.setURL(url);

    if (shouldHandleURL) {
      run(app.__deprecatedInstance__, 'handleURL', url);
    }
  });

  if (app._readinessDeferrals > 0) {
    router.initialURL = url;
    run(app, 'advanceReadiness');
    delete router.initialURL;
  } else {
    shouldHandleURL = true;
  }
});
