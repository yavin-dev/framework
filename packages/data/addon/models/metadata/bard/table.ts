/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Grain, Grains } from '@yavin/client/utils/date';
import TableMetadataModel, { TableMetadataPayload } from '../table';
import { upperFirst, sortBy } from 'lodash-es';
import type { Injector } from 'navi-data/models/native-with-create';

export type TimeGrain = {
  id: Grain;
  name: string;
};

export interface BardTableMetadataPayload extends TableMetadataPayload {
  timeGrainIds: Grain[];
  hasAllGrain: boolean;
}

export const GrainOrdering = Object.fromEntries(Grains.map((g, i) => [g, i])) as Record<Grain, number>;

export default class BardTableMetadataModel extends TableMetadataModel {
  constructor(injector: Injector, args: BardTableMetadataPayload) {
    super(injector, args);
    this.timeGrainIds = sortBy(this.timeGrainIds, (g) => GrainOrdering[g]);
  }

  /**
   * supported timegrains for the table
   */
  protected declare timeGrainIds: Grain[];

  /**
   * timeGrain objects with id and display name
   */
  get timeGrains(): TimeGrain[] {
    return this.timeGrainIds.map((grain) => ({ id: grain, name: upperFirst(grain) }));
  }

  /**
   * whether or not this table supports 'all' grain
   */
  declare hasAllGrain: boolean;
}
