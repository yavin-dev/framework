/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

/*jshint node:true*/
module.exports = {
  description: 'install navi-data into a typical project',

  normalizeEntityName: function() {}, // Required for `ember install` to run without error

  afterInstall: function(options) {
    return this.addAddonsToProject({
      packages: [
        { name: 'ember-ajax', target: '^2.4.1' },
        { name: 'ember-lodash', target: '4.17.0' },
        { name: 'ember-get-config', target: '0.2.4'},
      ]
    });
  }
};
