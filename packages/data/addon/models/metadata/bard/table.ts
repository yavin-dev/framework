/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Grain, Grains } from 'navi-data/utils/date';
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

export const GrainOrdering = Object.fromEntries(Grains.map((g, i) => [g, i])) as Record<Grain, number>;

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
