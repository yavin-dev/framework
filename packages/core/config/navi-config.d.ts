declare module 'navi-config' {
  export default interface NaviConfig {
    dataEpoch: string;
    user: string;
    FEATURES: Record<string, boolean | undefined>;
  }
}
