declare module 'navi-config' {
  import { Grain } from '@yavin/client/utils/date';
  export default interface NaviConfig {
    schedule?: { frequencies: string[]; formats: string[] };
    predefinedIntervalRanges: Record<Grain, string[] | undefined>;
  }
}
