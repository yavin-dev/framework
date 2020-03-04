'use strict';

module.exports = {
  name: 'navi-reports',

  included: function(app, parentAddon) {
    this._super.included.apply(this, arguments);

    var target = parentAddon || app;
    target.import('vendor/loader.css');
  },

  options: {
    babel: {
      plugins: ['@babel/plugin-proposal-optional-chaining']
    }
  }
};
