'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    'ember-cli-babel': {
      includePolyfill: true,
    },
    'ember-power-select': {
      theme: false,
    },
    sassOptions: {
      //standard ember-cli-sass options go here
      excludeFiles: [], // `app/styles` files not to be process as sass files
    },
    lessOptions: {
      //standard ember-cli-less options go here
      lessFiles: ['app'], // `app/styles` files to process as less files
      lessSuffix: '.less', // defaults to `.less`, output name suffix (ex: app --> app.less.css)
    },
  });

  /*
   * This build file specifies the options for the dummy test app of this
   * addon, located in `/tests/dummy`
   * This build file does *not* influence how the addon or the app using it
   * behave. You most likely want to be modifying `./index.js` or app's build file
   */

  return app.toTree();
};
