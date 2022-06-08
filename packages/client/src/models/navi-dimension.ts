/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { DimensionColumn } from './metadata/dimension.js';
import isEqual from 'lodash/isEqual.js';
import NativeWithCreate, { Injector } from './native-with-create.js';

interface NaviDimensionModelPayload {
  dimensionColumn: DimensionColumn;
  value: Readonly<unknown>;
  suggestions?: Readonly<Record<string, string>>;
}

export default class NaviDimensionModel extends NativeWithCreate {
  constructor(injector: Injector, args: NaviDimensionModelPayload) {
    super(injector, args);
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
  declare suggestions?: Readonly<Record<string, string>>;

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
