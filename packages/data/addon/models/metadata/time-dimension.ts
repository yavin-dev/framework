/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Dimension, { DimensionNode } from './dimension';

export type TimeDimensionNode = DimensionNode & {
  supportedGrains: string[];
  timeZone: string;
};
export type TimeDimensionEdge = {
  node: TimeDimensionNode;
  cursor: string;
};
export type TimeDimensionConnection = {
  edges: TimeDimensionEdge[];
  pageInfo: TODO;
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
