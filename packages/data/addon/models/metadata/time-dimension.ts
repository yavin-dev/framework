/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DimensionMetadataModel, { DimensionMetadata, DimensionMetadataPayload } from './dimension';

// Shape of public properties on model
export interface TimeDimensionMetadata extends DimensionMetadata {
  supportedGrains: string[];
  timeZone: TODO;
}
// Shape passed to model constructor
export interface TimeDimensionMetadataPayload extends DimensionMetadataPayload {
  supportedGrains: string[];
  timeZone: TODO;
}

export default class TimeDimensionMetadataModel extends DimensionMetadataModel
  implements TimeDimensionMetadata, TimeDimensionMetadataPayload {
  /**
   * @property {string[]} supportedGrains
   */
  supportedGrains!: string[];

  /**
   * @property {string} timeZone
   */
  timeZone!: string;
}
