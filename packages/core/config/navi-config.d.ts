declare module 'navi-config' {
  export default interface NaviConfig {
    user: string;
    appPersistence: {
      uri: string;
    };
    FEATURES: Record<string, boolean | undefined>;
  }
}
