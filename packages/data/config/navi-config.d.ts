declare module 'navi-config' {
  type NaviDataSource = {
    name: string;
    uri: string;
    type: string;
  };

  export default interface NaviConfig {
    dataEpoch: string;
    dataSources: NaviDataSource[];
    defaultDataSource?: string;
    searchThresholds: TODO;
    defaultTimeGrain?: string;
  }
}
