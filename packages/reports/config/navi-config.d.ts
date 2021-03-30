declare module 'navi-config' {
  import { Grain } from 'navi-data/utils/date';
  export default interface NaviConfig {
    schedule?: { frequencies: string[]; formats: string[] };
    defaultDataTable?: string;
    predefinedIntervalRanges: Record<Grain, string[] | undefined>;
  }
}
