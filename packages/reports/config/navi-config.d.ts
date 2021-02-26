declare module 'navi-config' {
  import { Grain } from 'navi-data/utils/date';
  export default interface NaviConfig {
    schedule: { frequencies: string[]; format: string[] };
    predefinedIntervalRanges: Record<Grain, string[] | undefined>;
  }
}
