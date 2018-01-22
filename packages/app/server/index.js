/**
  * Copyright 2017, Yahoo Holdings Inc.
  * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
  */
/* eslint-env node */
const useConfigMiddleware = require('../server-lib/use-config-middleware');

/**
  * Loads middleware when launching from ember-cli
  * For the production server see packages/app/index.js
  * @param app express App
  */
module.exports = function(app) {
  useConfigMiddleware(app);
};
