/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import config from 'ember-get-config';
import { warn } from '@ember/debug';
import { getWithDefault } from '@ember/object';

/**
 * Gets host by name in [{name: String, uri: String}]
 * config datastructure in config.navi.dataSources.
 *
 * @param {String} name - name of host to get
 * @returns {String} - uri of fact datasource to use
 */
export function getHost(name) {
  if (name) {
    const host = config.navi.dataSources.find(dataSource => dataSource.name === name);
    if (host && host.uri) {
      return host.uri;
    }
    warn(
      `Fact host for ${name} requested but none was found in configuration. Falling back to first configured datasource`,
      {
        id: 'navi-fact-host-not-configured'
      }
    );
  }
  return config.navi.dataSources[0].uri;
}

/**
 * Gets default data source from config, if none found use name of first dataSource
 * @returns {String} - name of default data source
 */
export function getDefaultDataSourceName() {
  return getWithDefault(config, 'navi.defaultDataSource', config.navi.dataSources[0].name);
}

/**
 * Gets the appropriate host given the adapter options
 * @param {Object} options - adapter options that includes dataSourceName
 * @returns {String} correct host for the options given
 */
export function configHost(options = {}) {
  const dataSourceName = getWithDefault(options, 'dataSourceName', getDefaultDataSourceName());
  return getHost(dataSourceName);
}
