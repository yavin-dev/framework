/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

var EOL = require('os').EOL;

module.exports = {
  description: 'Adding addons to project and update router js on install',

  normalizeEntityName: function() {}, // Required for `ember install` to run without error

  afterInstall: function() {
    return this.addAddonsToProject({
      packages: [
        { name: 'ember-composable-helpers',     target: '1.1.3' },
        { name: 'ember-cp-validations',         target: '3.1.2' },
        { name: 'ember-data-model-fragments',   target: '2.11.5' },
        { name: 'ember-get-config',             target: '0.2.4' },
        { name: 'ember-gridstack',              target: '1.0.1' },
        { name: 'ember-modal-dialog',           target: '0.9.0' },
        { name: 'ember-moment',                 target: '7.5.0' },
        { name: 'ember-power-select',           target: '1.10.4' },
        { name: 'ember-route-action-helper',    target: '^2.0.6' },
        { name: 'ember-tether',                 target: '0.4.1' },
        { name: 'ember-tooltips',               target: '2.9.2' },
        { name: 'ember-truth-helpers',          target: '2.0.0' },
        { name: 'ember-uuid',                   target: '^1.0.0' }
      ]
    }).then(function() {
      /*jshint multistr: true */

      //misaligned here so that it aligns in the app correctly
      var routeInfo = "\tthis.route('dashboardCollections', function() { " + EOL + "\
      this.route('collection', {path:'/:collectionId'}); " + EOL + "\
    });" + EOL + "\
    this.route('print', function() { " + EOL + "\
      this.route('dashboards', function() { " + EOL + "\
        this.route('dashboard', { path: '/:dashboardId' }, function() {" + EOL + "\
          this.route('view'); " + EOL + "\
        });" + EOL + "\
      });" + EOL + "\
    });" + EOL + "\
    this.route('dashboards', function() { " + EOL + "\
      this.route('new'); " + EOL + "\
      this.route('dashboard', { path: '/:dashboardId' }, function() {" + EOL + "\
        this.route('clone'); " + EOL + "\
        this.route('view'); " + EOL + "\
        this.route('widgets', function() { " + EOL + "\
          this.route('add'); " + EOL + "\
          this.route('new'); " + EOL + "\
          this.route('widget', { path: '/:widgetId'}, function() { " + EOL + "\
            this.route('edit'); " + EOL + "\
            this.route('view'); " + EOL + "\
          }); " + EOL + "\
        }); " + EOL + "\
      });" + EOL + "\
    });" + EOL;

      return this.insertIntoFile('app/router.js', routeInfo, {
          after: 'Router.map(function() {' + EOL
      });
    }.bind(this));
  }
};
