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
 * @returns default data source if one is configured otherwise the first data source
 */
export function getDefaultDataSource(): DataSource {
  const {
    navi: { defaultDataSource, dataSources }
  } = config;

  return defaultDataSource
    ? dataSources.find((source: DataSource) => source.name === defaultDataSource)
    : dataSources[0];
}

/**
 * @param name - name of the data source. falsey name will return default data source
 */
export function getDataSource(name?: string): DataSource {
  const {
    navi: { dataSources }
  } = config;

  if (name) {
    const host = dataSources.find((dataSource: DataSource) => dataSource.name === name);
    if (host) {
      return host;
    }
    assert(`Datasource ${name} should be configured in the navi environment`);
  }
  return getDefaultDataSource();
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
