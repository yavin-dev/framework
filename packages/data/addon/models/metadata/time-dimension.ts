/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Dimension, { DimensionMetadata } from './dimension';

export interface TimeDimensionMetadata extends DimensionMetadata {
  supportedGrains: string[];
  timeZone: TODO;
}

export default class TimeDimension extends Dimension implements TimeDimensionMetadata {
  /**
   * @property {string[]} supportedGrains
   */
  supportedGrains!: string[];

  /**
   * @property {string} timeZone
   */
  timeZone!: string;
}
