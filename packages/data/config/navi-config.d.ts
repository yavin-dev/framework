declare module 'navi-config' {
  type NaviDataSource = {
    name: string;
    uri: string;
    type: string;
  };

  export default interface NaviConfig {
    dataSources: NaviDataSource[];
    defaultDataSource?: string;
    searchThresholds: TODO;
  }
}
