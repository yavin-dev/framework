'use strict';

const path = require('path');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return process.env.DEV_NAVI;
  },

  options: {
    autoImport: {
      exclude: ['papaparse'] // only included during development
    }
  },

  treeForAddon(tree) {
    if (!this._isMirageEnabled()) {
      //Remove mirage files if not enabled
      tree = new Funnel(tree, { exclude: ['mirage/**'] });
    }
    return this._super.treeForAddon.call(this, tree);
  },

  treeForVendor(vendorTree) {
    const trees = [];

    if (vendorTree) {
      trees.push(vendorTree);
    }

    if (this._isMirageEnabled()) {
      const papaTree = new Funnel(path.resolve(require.resolve('papaparse'), '..'), { files: ['papaparse.js'] });
      trees.push(papaTree);
    }

    return new MergeTrees(trees);
  },

  _isMirageEnabled() {
    if (this._mirageEnabled !== undefined) {
      return this._mirageEnabled;
    }

    const host = this._findHost();
    const mirageConfig = host.project.config(host.env)['ember-cli-mirage'] || {};
    const mirageEnabled = !!mirageConfig.enabled;
    const notProd = host.env !== 'production';
    this._mirageEnabled = mirageEnabled || notProd;
    return this._mirageEnabled;
  },

  included() {
    this._super.included.apply(this, arguments);

    if (this._isMirageEnabled()) {
      this.import('vendor/papaparse.js', { using: [{ transformation: 'amd', as: 'papaparse' }] });
    }
  }
};
