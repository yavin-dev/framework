declare module 'navi-config' {
  import { Grain } from 'navi-data/utils/date';
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export default interface NaviConfig {
    predefinedIntervalRanges: Record<Grain, string[] | undefined>;
  }
}
