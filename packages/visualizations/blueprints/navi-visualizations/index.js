/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

/*jshint node:true*/
module.exports = {
  description: 'install required ember addons into a typical project',

  normalizeEntityName: function() {}, // Required for `ember install` to run without error

  afterInstall: function() {
    return this.addAddonsToProject({
      packages: [
        { name: 'ember-cli-format-number',      target: '^2.0.0' },
        { name: 'ember-collection',             target: '1.0.0-alpha.7' },
        { name: 'ember-composable-helpers',     target: '^2.1.0' },
        { name: 'ember-cp-validations',         target: '3.1.2' },
        { name: 'ember-c3',                     target: '0.2.3' },
        { name: 'ember-data-model-fragments',   target: '2.11.5' },
        { name: 'ember-debounced-properties',   target: '0.0.5' },
        { name: 'ember-get-config',             target: '0.2.4' },
        { name: 'ember-lodash',                 target: '4.17.2' },
        { name: 'ember-math-helpers',           target: '2.3.0' },
        { name: 'ember-moment',                 target: '7.5.0' },
        { name: 'ember-power-select',           target: '1.10.4' },
        { name: 'ember-radio-button',           target: '1.2.1' },
        { name: 'ember-sortable',               target: '1.10.0' },
        { name: 'ember-tether',                 target: '0.4.1' },
        { name: 'ember-toggle',                 target: '5.2.1' },
        { name: 'ember-tooltips',               target: '2.9.2' },
        { name: 'ember-truth-helpers',          target: '2.0.0' },
        { name: 'navi',                         target: '^8.0.0' },
        { name: 'navi-data',                    target: '^8.0.0' },
        { name: 'navi-core',                    target: '^8.0.0' }
      ]
    });
  }
};
