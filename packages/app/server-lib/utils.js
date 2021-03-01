/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
/* eslint-env node */
const path = require('path');
const merge = require('merge');

/*
 * Loads environment settings for process.env.APP_ENV || 'local'
 */
function loadEnvironmentSettings(hostname, configFile = './config/environments.json') {
  const environments = require(path.resolve(configFile));
  const defaultSettings = environments['default'];

  console.log(`process.env.APP_ENV=${process.env.APP_ENV}`) || 'local';
  const environment = process.env.APP_ENV || 'local';
  const settings = environments[environment] || {};

  return merge.recursive(true, defaultSettings, settings);
}

exports.loadEnvironmentSettings = loadEnvironmentSettings;
