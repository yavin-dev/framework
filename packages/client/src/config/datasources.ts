/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import invariant from 'tiny-invariant';
import omit from 'lodash/omit.js';
import type { Grain } from '../utils/date.js';

type DataSourceNamespace = {
  name: string;
  displayName: string;
  description?: string;
  hide?: boolean;
  suggestedDataTables?: string[];
};

export type BaseDataSource<Type, Options = void> = DataSourceNamespace & {
  type: Type;
  uri: string;
  options?: Options;
  namespaces?: DataSourceNamespace[];
};

// TODO Move to fili plugin
export interface FiliConfigOptions {
  enableDimensionSearch?: boolean;
  enableSubtotals?: boolean;
  sinceOperatorEndPeriod?: string;
}
// TODO Move to fili plugin
export type FiliDataSource = BaseDataSource<'bard', FiliConfigOptions>;

// TODO Move to elide plugin
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ElideConfigOptions {
  // elide options here
}
// TODO Move to elide plugin
export type ElideDataSource = BaseDataSource<'elide', ElideConfigOptions>;

export interface DataSourceRegistry {
  [type: string]: BaseDataSource<string, void | Record<string, any>>;
  bard: FiliDataSource;
  elide: ElideDataSource;
}

export type DataSourceConfig = DataSourceRegistry[keyof DataSourceRegistry];

interface CardinalityConfig {
  small: number;
  medium: number;
}
interface DimensionCacheConfig {
  timeoutMs: number;
  maxSize: number;
}

export interface NaviConfig {
  dataSources: DataSourceConfig[];
  defaultDataSource?: string;
  cardinalities: CardinalityConfig;
  defaultTimeGrain?: Grain;
  dimensionCache: DimensionCacheConfig;
}

export class ClientConfig implements NaviConfig {
  dataSources: DataSourceConfig[];
  defaultDataSource?: string;
  cardinalities: CardinalityConfig;
  defaultTimeGrain?: Grain;
  dimensionCache: DimensionCacheConfig;
  constructor(config: NaviConfig) {
    this.dataSources = config.dataSources;
    this.cardinalities = config.cardinalities;
    this.defaultDataSource = config.defaultDataSource;
    this.defaultTimeGrain = config.defaultTimeGrain;
    this.dimensionCache = config.dimensionCache;
  }

  /**
   * Returns data source object for a data source name
   * @param dataSourceName
   */
  getDataSource<T extends keyof DataSourceRegistry>(dataSourceName: string): DataSourceRegistry[T] {
    invariant(dataSourceName, 'getDataSource should be given a data source name to lookup');

    const { dataSources } = this;
    const [lookupName, lookupNamespace] = dataSourceName.split('.');
    const dataSource = dataSources.find(({ name }) => name === lookupName);
    if (!dataSource) {
      throw new Error(`Datasource "${lookupName}" should be configured in the navi environment`);
    }
    if (lookupNamespace) {
      const namespace = dataSource.namespaces?.find(({ name }) => name === lookupNamespace);
      if (!namespace) {
        throw new Error(
          `Namespace "${lookupNamespace}" should be configured for datasource "${lookupName}" in the navi environment`
        );
      }
      return {
        ...omit(dataSource, ['namespaces']),
        ...namespace,
        name: dataSourceName,
      };
    }
    return dataSource;
  }

  /**
   * @returns default data source if one is configured otherwise the first data source
   */
  getDefaultDataSource(): DataSourceConfig {
    const { defaultDataSource, dataSources } = this;
    return defaultDataSource ? this.getDataSource(defaultDataSource) : dataSources[0];
  }

  /**
   * Gets the appropriate host given the adapter options
   * @param options - adapter options that includes dataSourceName
   * @returns correct host for the options given
   */
  configHost(options: { dataSourceName?: string } = {}): string {
    const { dataSourceName } = options;
    const dataSource = dataSourceName ? this.getDataSource(dataSourceName) : this.getDefaultDataSource();
    return dataSource.uri;
  }
}
