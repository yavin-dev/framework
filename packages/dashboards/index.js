'use strict';

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return process.env.DEV_NAVI;
  },

  included: function(app, parentAddon) {
    this._super.included.apply(this, arguments);

    const target = parentAddon || app;

    target.import('vendor/loader.css');
  }
};
