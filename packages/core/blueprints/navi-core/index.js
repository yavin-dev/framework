/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
module.exports = {
  description: 'Add navi-core dependencies',

  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addAddonsToProject({
      packages: [
        { name: 'ember-moment', target: '7.5.0' },
        { name: 'ember-font-awesome', target: '3.0.5'},
        { name: 'ember-get-config', target: '0.2.4'},
        { name: 'ember-cli-format-number', target: '2.0.0'}
      ]
    });
  }
};
