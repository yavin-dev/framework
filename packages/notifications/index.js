'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    autoImport: {
      exclude: ['navi-core'],
    },
  },
  isDevelopingAddon() {
    return process.env.DEV_NAVI;
  },
};
