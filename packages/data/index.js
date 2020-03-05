'use strict';

const path = require('path');
const Funnel = require('broccoli-funnel');
const name = require('./package').name;
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name,
  options: {
    autoImport: {
      exclude: ['papaparse'] // only included during development
    },
    babel: {
      plugins: ['@babel/plugin-proposal-optional-chaining']
    }
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
