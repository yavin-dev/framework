/* eslint-env node */
'use strict';

module.exports = {
  name: 'navi-core',

  included() {
    this._super.included.apply(this, arguments);
    this.import('node_modules/perfect-scrollbar/dist/perfect-scrollbar.min.js');
    this.import('node_modules/perfect-scrollbar/css/perfect-scrollbar.css');
  }
};
