/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { DimensionColumn } from './metadata/dimension';
import { isEqual } from 'lodash-es';

export default class NaviDimensionModel extends EmberObject {
  /**
   * Dimension column definition
   */
  dimensionColumn!: DimensionColumn;

  /**
   * Dimension value
   */
  value!: Readonly<unknown>;

  /**
   * Dimension value for display purposes
   */
  get displayValue() {
    return `${this.value}`;
  }

  isEqual(other: NaviDimensionModel) {
    if (this === other) {
      return true;
    }
    return (
      this.value === other.value &&
      this.dimensionColumn.columnMetadata === other.dimensionColumn.columnMetadata &&
      isEqual(this.dimensionColumn.parameters, other.dimensionColumn.parameters)
    );
  }
}
