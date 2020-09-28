declare module 'navi-config' {
  export default interface NaviConfig {
    user: string;
    FEATURES: Record<string, boolean | undefined>;
  }
}
