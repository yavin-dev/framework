'use strict';

module.exports = {
  name: require('./package').name,

  included: function(app, parentAddon) {
    this._super.included.apply(arguments);

    var target = parentAddon || app;

    target.import('vendor/loader.css');
  }
};
