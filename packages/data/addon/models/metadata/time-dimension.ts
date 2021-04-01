/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DimensionMetadataModel from 'navi-data/models/metadata/dimension';
import type { DimensionMetadata, DimensionMetadataPayload } from 'navi-data/models/metadata/dimension';
import type { ColumnInstance, ColumnType } from 'navi-data/models/metadata/column';
import { Grain } from 'navi-data/utils/date';

interface TimeDimensionGrain {
  id: Grain;
  expression: string;
  grain: string;
}
// Shape of public properties on model
export interface TimeDimensionMetadata extends DimensionMetadata {
  supportedGrains: TimeDimensionGrain[];
  timeZone: TODO;
}
// Shape passed to model constructor
export interface TimeDimensionMetadataPayload extends DimensionMetadataPayload {
  supportedGrains: TimeDimensionGrain[];
  timeZone: TODO;
}

export type TimeDimensionColumn = ColumnInstance<TimeDimensionMetadataModel>;

export default class TimeDimensionMetadataModel
  extends DimensionMetadataModel
  implements TimeDimensionMetadata, TimeDimensionMetadataPayload {
  metadataType: ColumnType = 'timeDimension';
  /**
   * @property {TimeDimensionGrain[]} supportedGrains
   */
  supportedGrains!: TimeDimensionGrain[];

  /**
   * @property {string} timeZone
   */
  timeZone!: string;
}

declare module 'navi-data/models/metadata/registry' {
  export default interface MetadataModelRegistry {
    timeDimension: TimeDimensionMetadataModel;
  }
}
