/**
  * Copyright 2017, Yahoo Holdings Inc.
  * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
  */
/* eslint-env node */
const express = require('express');

module.exports = function(app, path) {
  app.use(express.static(path + '/dist'));
};
