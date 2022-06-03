/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DimensionMetadataModel from './dimension.js';
import type { DimensionMetadataPayload } from './dimension.js';
import type { ColumnInstance, ColumnType } from './column.js';
import type { Grain } from '../../utils/date.js';
import type { Injector } from '../native-with-create.js';

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

declare module './registry' {
  export default interface MetadataModelRegistry {
    timeDimension: TimeDimensionMetadataModel;
  }
}
