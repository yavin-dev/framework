import { Grain } from 'navi-data/utils/date';
import TableMetadataModel, { TableMetadata, TableMetadataPayload } from '../table';
import { upperFirst, sortBy } from 'lodash-es';

export type TimeGrain = {
  id: Grain;
  name: string;
};

export interface BardTableMetadataPayload extends TableMetadataPayload {
  timeGrainIds: Grain[];
  hasAllGrain: boolean;
}

export interface BardTableMetadata extends TableMetadata {
  timeGrains: TimeGrain[];
  hasAllGrain: boolean;
}

export const GrainOrdering: Record<Grain, number> = {
  second: 1,
  minute: 2,
  hour: 3,
  day: 4,
  week: 5,
  isoWeek: 5,
  month: 6,
  quarter: 7,
  year: 8
};

export default class BardTableMetadataModel extends TableMetadataModel implements BardTableMetadataModel {
  init() {
    //@ts-ignore
    super.init(...arguments);
    this.timeGrainIds = sortBy(this.timeGrainIds, g => GrainOrdering[g]);
  }

  /**
   * @property timeGrainIds - supported timegrains for the table
   */
  timeGrainIds: Grain[] = [];

  /**
   * @property timeGrains - timeGrain objects with id and display name
   */
  get timeGrains(): TimeGrain[] {
    return this.timeGrainIds.map(grain => ({ id: grain, name: upperFirst(grain) }));
  }

  /**
   * @property hasAllGrain - whether or not this table supports 'all' grain
   */
  hasAllGrain!: boolean;
}
