/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import config from 'ember-get-config';
import { assert } from '@ember/debug';

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
export function getDataSource(name: string): DataSource {
  assert('getDataSource should be given a data source name to lookup', name);

  const {
    navi: { dataSources }
  } = config;

  const host = dataSources.find((dataSource: DataSource) => dataSource.name === name);
  if (host) {
    return host;
  }
  assert(`Datasource ${name} should be configured in the navi environment`);
}

/**
 * @returns default data source if one is configured otherwise the first data source
 */
export function getDefaultDataSource(): DataSource {
  const {
    navi: { defaultDataSource, dataSources }
  } = config;

  return defaultDataSource ? getDataSource(defaultDataSource) : dataSources[0];
}

/**
 * Gets default data source from config, if none found use name of first dataSource
 * @returns name of default data source
 */
export function getDefaultDataSourceName(): string {
  return getDefaultDataSource().name;
}

/**
 * Gets the appropriate host given the adapter options
 * @param options - adapter options that includes dataSourceName
 * @returns correct host for the options given
 */
export function configHost(options: SourceAdapterOptions = {}): string {
  const { dataSourceName } = options;
  return dataSourceName ? getDataSource(dataSourceName).uri : getDefaultDataSource().uri;
}
