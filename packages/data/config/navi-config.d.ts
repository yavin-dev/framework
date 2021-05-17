import { Grain } from 'navi-data/utils/date';
declare module 'navi-config' {
  export type BaseDataSource<Type, Options = void> = {
    type: Type;
    name: string;
    displayName: string;
    description?: string;
    uri: string;
    options?: Options;
  };

  export interface FiliConfigOptions {
    enableDimensionSearch?: boolean;
  }
  export type FiliDataSource = BaseDataSource<'bard', FiliConfigOptions>;

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
    dataEpoch: string;
    dataSources: NaviDataSource[];
    defaultDataSource?: string;
    cardinalities: {
      small: number;
      medium: number;
    };
    defaultTimeGrain?: Grain;
  }
}
