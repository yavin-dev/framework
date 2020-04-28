/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Dimension, { NormalizedDimension } from './dimension';

export type NormalizedTimeDimension = NormalizedDimension & {
  supportedGrains: string[];
  timeZone: TODO;
};

export default class TimeDimension extends Dimension {
  /**
   * @property {string[]} supportedGrains
   */
  supportedGrains!: string[];

  /**
   * @property {string} timeZone
   */
  timeZone!: string;
}
