/**
  * Copyright 2017, Yahoo Holdings Inc.
  * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
  */
/* eslint-env node */
module.exports = function(app) {
  app.use('*.js|*.css|*.png|*.jpg|*.gif|*.svg|/fonts/*', function(req, res, next) {
    const expireDays = 14;
    const expires = expireDays * 24 * 60 * 60;
    res.header('Cache-Control', 'public, max-age=' + expires + ', must-revalidate');
    res.header('Expires', new Date(Date.now() + expires * 1000).toUTCString());
    return next();
  });
};
