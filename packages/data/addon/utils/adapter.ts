/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import config from 'ember-get-config';
import { assert } from '@ember/debug';
import { DataSourceRegistry, NaviDataSource } from 'navi-config';

export type SourceAdapterOptions = {
  dataSourceName?: string;
};

/**
 * Returns data source object for a data source name
 * @param dataSourceName
 */
export function getDataSource<T extends keyof DataSourceRegistry>(dataSourceName: string): DataSourceRegistry[T] {
  assert('getDataSource should be given a data source name to lookup', dataSourceName);

  const {
    navi: { dataSources },
  } = config;
  const dataSource = dataSources.find(({ name }) => name === dataSourceName);
  if (dataSource) {
    return dataSource as DataSourceRegistry[T];
  }
  throw new Error(`Datasource ${dataSourceName} should be configured in the navi environment`);
}

/**
 * @returns default data source if one is configured otherwise the first data source
 */
export function getDefaultDataSource(): NaviDataSource {
  const {
    navi: { defaultDataSource, dataSources },
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

/**
 * Returns data source namespace given a data source name
 * @param options - adapter options that include dataSourceName
 * @returns datasource namespace or undefined
 */
export function getDataSourceNamespace(options: SourceAdapterOptions = {}): string | undefined {
  const { dataSourceName } = options;
  const dataSource = dataSourceName ? getDataSource(dataSourceName) : getDefaultDataSource();
  return dataSource.namespace || undefined;
}
