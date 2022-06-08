'use strict';
let Funnel = require('broccoli-funnel');
let mergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return process.env.DEV_NAVI;
  },

  included: function (app, parentAddon) {
    this._super.included.apply(this, arguments);

    const target = parentAddon || app;
    target.import('vendor/loader.css');
  },

  /**
   * Override to include this packages `public` dir files
   */
  treeForPublic(tree) {
    const assetsTree = new Funnel('public');
    return mergeTrees([tree, assetsTree], { overwrite: true });
  },
};
