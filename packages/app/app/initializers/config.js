/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import config from 'navi-app/config/environment';

export function initialize() {
  // Add server provided app settings into the environment
  config.appSettings = window.NAVI_APP.appSettings;

  // Navi specific configuration
  Object.assign(config.navi, {
    user: config.appSettings.user,
    /*
     *TODO: set epoch date
     *dataEpoch: NAVI_APP.appSettings.dataEpoch,
     */
    dataSources: [{ name: 'facts', uri: config.appSettings.factApiHost }],
    appPersistence: {
      type: 'webservice',
      uri: config.appSettings.persistenceApiHost,
      timeout: 90000
    }
  });
}

export default {
  name: 'config',
  initialize
};
