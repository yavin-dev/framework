/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Blueprint utility to auto-insert the custom reports routes after installing the addon
 */

var EOL = require('os').EOL;

module.exports = {
  description: 'Auto-insert the custom reports routes after installing the addon',

  normalizeEntityName: function() {},

  afterInstall: function() {
    /*jshint multistr: true */
    var routeInfo =
      "\tthis.route('reports', function() {" +
      EOL +
      "\
        this.route('new');" +
      EOL +
      "\
        this.route('report', { path: '/:report_id'}, function() {" +
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
      "\tthis.route('report-collections', function() {" +
      EOL +
      "\
        this.route('collection', {path: '/:collection_id'})" +
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
            this.route('report', { path: '/:report_id'}, function() {" +
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
  }
};
