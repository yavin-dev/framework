import { Grain } from 'navi-data/utils/date';

declare module 'navi-config' {
  type NaviDataSource = {
    name: string;
    displayName: string;
    description?: string;
    uri: string;
    type: string;
  };

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
