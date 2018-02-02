/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
/* eslint-env node */
/*jslint nomen: true, node:true */
const express = require('express'),
      useConfigMiddleware           = require('./server-lib/use-config-middleware'),
      useCompressionMiddleware      = require('./server-lib/use-compression-middleware'),
      useCacheMiddleware            = require('./server-lib/use-cache-middleware'),
      useStaticAssetMiddleware      = require('./server-lib/use-static-asset-middleware'),
      useFallbackResourceMiddleware = require('./server-lib/use-fallback-resource-middleware');

process.chdir(__dirname);

const app = express();

// Handle environment config
useConfigMiddleware(app);

//compression and static asset cache
useCompressionMiddleware(app);
useCacheMiddleware(app);

// Serve assets
useStaticAssetMiddleware(app, __dirname);

/*
 * If a requested path can't be found,
 * let Ember determine if the path is a valid route
 */
useFallbackResourceMiddleware(app, __dirname);

const port = process.env.PORT || 80;
app.listen(port);

// eslint-disable-next-line no-console
console.log('Hey, listening on port: ' + port);
