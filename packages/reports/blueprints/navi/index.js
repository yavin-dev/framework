/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Blueprint utility to auto-insert the custom reports routes after installing the addon
 */

var EOL = require('os').EOL;

module.exports = {
  description: 'Auto-insert the custom reports routes after installing the addon',

  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addAddonsToProject({
      packages: [
        { name: 'ember-cli-bootstrap-datepicker', target: '0.5.3' },
        { name: 'ember-cli-clipboard', target: '0.8.1' },
        { name: 'ember-collection', target: '1.0.0-alpha.7' },
        { name: 'ember-composable-helpers', target: '^2.1.0' },
        { name: 'ember-cli-string-helpers', target: '^1.6.0' },
        { name: 'ember-cp-validations', target: '3.1.2' },
        { name: 'ember-data-model-fragments', target: '2.11.5' },
        { name: 'ember-modal-dialog', target: '2.4.1' },
        { name: 'ember-pluralize', target: '0.2.0' },
        { name: 'ember-power-select', target: '1.10.4' },
        { name: 'ember-promise-helpers', target: '^1.0.3' },
        { name: 'ember-radio-button', target: '1.2.1' },
        { name: 'ember-resize', target: '0.0.17' },
        { name: 'ember-route-action-helper', target: '^2.0.6' },
        { name: 'ember-tag-input', target: '1.2.1' },
        { name: 'ember-tether', target: '1.0.0' },
        { name: 'ember-tooltips', target: '2.9.2' },
        { name: 'ember-truth-helpers', target: '2.0.0' },
        { name: 'ember-uuid', target: '^1.0.0' },
        { name: 'liquid-fire', target: '^0.29.2' }
      ]
    }).then(
      function() {
        /*jshint multistr: true */
        var routeInfo =
          "\tthis.route('reports', function() {" +
          EOL +
          "\
            this.route('new');" +
          EOL +
          "\
            this.route('report', { path: '/:reportId'}, function() {" +
          EOL +
          "\
                this.route('view');" +
          EOL +
          "\
                this.route('edit');" +
          EOL +
          "\
                this.route('clone');" +
          EOL +
          "\
                this.route('save-as');" +
          EOL +
          "\
                this.route('unauthorized');" +
          EOL +
          '\
            });' +
          EOL +
          '\
        });' +
          EOL;

        routeInfo +=
          "\tthis.route('reportCollections', function() {" +
          EOL +
          "\
            this.route('collection', {path: '/:collectionId'})" +
          EOL +
          '\
        });' +
          EOL;

        routeInfo +=
          "\tthis.route('print', function() {" +
          EOL +
          "\
            this.route('reports', function() {" +
          EOL +
          "\
                this.route('new');" +
          EOL +
          "\
                this.route('report', { path: '/:reportId'}, function() {" +
          EOL +
          "\
                    this.route('view');" +
          EOL +
          '\
                });' +
          EOL +
          '\
            });' +
          EOL +
          '\
        });' +
          EOL;

        return this.insertIntoFile('app/router.js', routeInfo, {
          after: 'Router.map(function() {' + EOL
        });
      }.bind(this)
    );
  }
};
