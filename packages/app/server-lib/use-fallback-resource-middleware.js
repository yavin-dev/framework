/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
/* eslint-env node */
module.exports = function(app, path) {
  app.use(function(req, res) {
    res.sendFile(path + '/dist/index.html');
  });
};
