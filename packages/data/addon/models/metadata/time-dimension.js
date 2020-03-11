/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Dimension from './dimension';

export default class TimeDimension extends Dimension {
  /**
   * @property {String[]} supportedGrains
   */
  supportedGrains;

  /**
   * @property {String} timeZone
   */
  timeZone;
}
