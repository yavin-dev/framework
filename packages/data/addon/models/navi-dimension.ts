/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { DimensionColumn } from 'navi-data/adapters/dimensions/interface';

export default class NaviDimensionModel extends EmberObject {
  /**
   * Dimension column definition
   */
  dimensionColumn!: DimensionColumn;

  /**
   * Dimension value
   */
  value!: unknown;

  /**
   * Dimension value for display purposes
   */
  get displayValue() {
    return `${this.value}`;
  }
}
