/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { DimensionColumn } from 'navi-data/models/metadata/dimension';
import { isEqual } from 'lodash-es';
import NativeWithCreate from 'navi-data/models/native-with-create';

interface NaviDimensionModelPayload {
  dimensionColumn: DimensionColumn;
  value: Readonly<unknown>;
  suggestions?: Readonly<unknown[]>;
}

export default class NaviDimensionModel extends NativeWithCreate {
  constructor(owner: unknown, args: NaviDimensionModelPayload) {
    super(owner, args);
  }

  /**
   * Dimension column definition
   */
  declare dimensionColumn: DimensionColumn;

  /**
   * Dimension value
   */
  declare value: Readonly<unknown>;

  /**
   * Dimension value
   */
  declare suggestions?: Readonly<unknown[]>;

  /**
   * Dimension value for display purposes
   */
  get displayValue() {
    const { value, suggestions } = this;
    if (suggestions?.length) {
      return `${value} (${suggestions.join(', ')})`;
    }
    return `${value}`;
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
