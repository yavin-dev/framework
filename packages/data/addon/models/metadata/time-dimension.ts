/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { DimensionMetadataPayload } from 'navi-data/models/metadata/dimension';
import type { ColumnInstance, ColumnType } from 'navi-data/models/metadata/column';
import { Grain } from '@yavin/client/utils/date';
import { Injector } from '../native-with-create';

interface TimeDimensionGrain {
  id: Grain;
  expression: string;
  grain: string;
}

// Shape passed to model constructor
export interface TimeDimensionMetadataPayload extends DimensionMetadataPayload {
  supportedGrains: TimeDimensionGrain[];
  timeZone: string;
}

export type TimeDimensionColumn = ColumnInstance<TimeDimensionMetadataModel>;

export default class TimeDimensionMetadataModel extends DimensionMetadataModel {
  constructor(injector: Injector, args: TimeDimensionMetadataPayload) {
    super(injector, args);
  }
  metadataType: ColumnType = 'timeDimension';

  declare supportedGrains: TimeDimensionGrain[];

  declare timeZone: string;
}

declare module 'navi-data/models/metadata/registry' {
  export default interface MetadataModelRegistry {
    timeDimension: TimeDimensionMetadataModel;
  }
}
