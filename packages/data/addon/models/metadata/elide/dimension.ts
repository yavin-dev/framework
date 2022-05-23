/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import CARDINALITY_SIZES from '@yavin/client/utils/enums/cardinality-sizes';
import type { Injector } from 'navi-data/models/native-with-create';
import DimensionMetadataModel, { DimensionMetadataPayload } from '../dimension';

export enum ValueSourceType {
  ENUM = 'ENUM',
  TABLE = 'TABLE',
  NONE = 'NONE',
}

export interface ElideDimensionMetadataPayload extends DimensionMetadataPayload {
  valueSourceType: ValueSourceType;
  values: string[];
}

export default class ElideDimensionMetadataModel extends DimensionMetadataModel {
  constructor(injector: Injector, args: ElideDimensionMetadataPayload) {
    super(injector, args);
    if (this.hasEnumValues && this.cardinality === undefined) {
      this.cardinality = CARDINALITY_SIZES[0];
    }
  }

  declare values: string[];

  get valueSource(): ElideDimensionMetadataModel {
    if ('TABLE' === this.valueSourceType) {
      const id = this.tableSource?.valueSource || '';
      const column = this.naviMetadata.getById('dimension', id, this.source) as ElideDimensionMetadataModel | undefined;
      return column || this;
    }
    return this;
  }

  get hasEnumValues(): boolean {
    return 'ENUM' === this.valueSourceType;
  }
}
