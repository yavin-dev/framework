/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Grain } from 'navi-data/utils/date';
declare module 'navi-config' {
  export type DataSourceNamespace = {
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

  export interface FiliConfigOptions {
    enableDimensionSearch?: boolean;
    enableSubtotals?: boolean;
    sinceOperatorEndPeriod?: string;
  }
  export type FiliDataSource = BaseDataSource<'bard', FiliConfigOptions>;

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ElideConfigOptions {
    // elide options here
  }

  export type ElideDataSource = BaseDataSource<'elide', ElideConfigOptions>;

  interface DataSourceRegistry {
    bard: FiliDataSource;
    elide: ElideDataSource;
  }

  export type NaviDataSource = DataSourceRegistry[keyof DataSourceRegistry];

  export default interface NaviConfig {
    availability?: {
      timeoutMs?: number;
      cacheMs?: number;
    };
    dataEpoch: string;
    dataSources: NaviDataSource[];
    defaultDataSource?: string;
    cardinalities: {
      small: number;
      medium: number;
    };
    defaultTimeGrain?: Grain;
    dimensionCache: {
      timeoutMs: number;
      maxSize: number;
    };
  }
}
