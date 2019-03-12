'use strict';

module.exports = {
  name: 'navi-reports',

  options: {
    nodeAssets: {
      'json-url': {
        srcDir: 'dist/browser',
        import: ['json-url.js', 'json-url-lzstring.js', 'json-url-safe64.js']
      }
    }
  },

  included: function(app, parentAddon) {
    this._super.included.apply(this, arguments);

    var target = parentAddon || app;
    target.import('vendor/loader.css');
  }
};
