/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import config from 'ember-get-config';
import { warn } from '@ember/debug';
import { getWithDefault } from '@ember/object';

type DataSource = {
  name: string;
  uri: string;
  type: string;
};
export type SourceAdapterOptions = {
  dataSourceName?: string;
};

/**
 * @param field - requested field from datasource entry
 * @param name - name of datasource entry
 * @returns field of the datasource entry with matching name
 */
export function getDataSourceField(field: string, name?: string): string {
  if (name) {
    const host = config.navi.dataSources.find((dataSource: DataSource) => dataSource.name === name);
    if (host && host[field]) {
      return host[field];
    }
    warn(
      `Fact host for ${name} requested but none was found in configuration. Falling back to first configured datasource`,
      {
        id: 'navi-fact-host-not-configured'
      }
    );
  }
  return config.navi.dataSources[0][field];
}

/**
 * Gets host by name in [{name: String, uri: String}]
 * config datastructure in config.navi.dataSources.
 *
 * @param name - name of host to get
 * @returns requested field of fact datasource to
 */
export function getHost(name: string | undefined): string {
  return getDataSourceField('uri', name);
}

/**
 * Gets default data source from config, if none found use name of first dataSource
 * @returns name of default data source
 */
export function getDefaultDataSourceName(): string {
  return getWithDefault(config, 'navi.defaultDataSource', config.navi.dataSources[0].name);
}

/**
 * Gets the appropriate host given the adapter options
 * @param options - adapter options that includes dataSourceName
 * @returns correct host for the options given
 */
export function configHost(options: SourceAdapterOptions = {}): string {
  const dataSourceName = getWithDefault(options, 'dataSourceName', getDefaultDataSourceName());
  return getHost(dataSourceName);
}
