/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import config from 'ember-get-config';
import { warn } from '@ember/debug';

type DataSource = {
  name: string;
  uri: string;
  type: string;
};
export type SourceAdapterOptions = {
  dataSourceName?: string;
};

/**
 * @param name - name of the data source. falsey name will return default data source
 */
export function getDataSource(name?: string): DataSource {
  const {
    navi: { defaultDataSource, dataSources }
  } = config;

  if (name) {
    const host = dataSources.find((dataSource: DataSource) => dataSource.name === name);
    if (host) {
      return host;
    }
    warn(
      `Fact host for ${name} requested but none was found in configuration. Falling back to configured default datasource`,
      {
        id: 'navi-fact-host-not-configured'
      }
    );
  }
  return defaultDataSource
    ? dataSources.find((source: DataSource) => source.name === defaultDataSource)
    : dataSources[0];
}

/**
 * Gets default data source from config, if none found use name of first dataSource
 * @returns name of default data source
 */
export function getDefaultDataSourceName(): string {
  return getDataSource().name;
}

/**
 * Gets the appropriate host given the adapter options
 * @param options - adapter options that includes dataSourceName
 * @returns correct host for the options given
 */
export function configHost(options: SourceAdapterOptions = {}): string {
  return getDataSource(options.dataSourceName).uri;
}
