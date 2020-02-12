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
    }
  },

  treeForVendor(vendorTree) {
    const trees = [];

    if (vendorTree) {
      trees.push(vendorTree);
    }

    if (this._includeDevDependencies()) {
      const papaTree = new Funnel(path.resolve(require.resolve('papaparse'), '..'), { files: ['papaparse.js'] });
      trees.push(papaTree);
    }

    return new MergeTrees(trees);
  },

  _includeDevDependencies() {
    return ['development', 'test'].includes(this._findHost().env);
  },

  included() {
    this._super.included.apply(this, arguments);

    if (this._includeDevDependencies()) {
      this.import('vendor/papaparse.js', { using: [{ transformation: 'amd', as: 'papaparse' }] });
    }
  }
};
