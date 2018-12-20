/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
/* eslint-env node */
const path = require('path');
const merge = require('merge');

/*
 * Given a hostname and config file, returns the environment specific
 * settings. If the hostname is not found it will return default values.
 */
function loadEnvironmentSettings(hostname, configFile) {
  const configuration = require(path.resolve(configFile)),
    normalizedHost = /^127.0.0.1:\d+/.test(hostname) || /^localhost:\d+/.test(hostname) ? 'localhost' : hostname,
    defaultSettings = configuration['default'],
    settings = configuration[normalizedHost] || {};

  return merge.recursive(true, defaultSettings, settings);
}

/**
 * Default function that returns the current user of the app.
 * Here it is hardcoded. Override by making your own function to grab the authenticated user.
 * Used in use-config-middleware.js
 * @returns {string} current user
 */
function getUser() {
  return 'navi_user';
}

exports.loadEnvironmentSettings = loadEnvironmentSettings;
exports.getUser = getUser;
