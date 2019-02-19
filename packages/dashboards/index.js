/* eslint-env node */
'use strict';

module.exports = {
  name: 'navi-dashboards',

  included: function(app, parentAddon) {
    this._super.included.apply(arguments);

    var target = parentAddon || app;

    target.import('vendor/loader.css');
  }
};
