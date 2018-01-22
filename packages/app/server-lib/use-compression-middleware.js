/**
  * Copyright 2017, Yahoo Holdings Inc.
  * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
  */
/* eslint-env node */
const compression = require('compression');

module.exports = function(app) {
  app.use(compression());
};
