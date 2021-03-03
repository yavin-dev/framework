/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DimensionMetadataModel, { DimensionMetadataPayload } from '../dimension';

export type ValueSourceType = 'ENUM' | 'TABLE' | 'NONE';

export interface ElideDimensionMetadataPayload extends DimensionMetadataPayload {
  valueSourceType: ValueSourceType;
  tableSource: string | null;
  values: string[];
}

export default class ElideDimensionMetadataModel
  extends DimensionMetadataModel
  implements ElideDimensionMetadataPayload {
  valueSourceType!: ValueSourceType;
  tableSource!: string | null;
  values!: string[];

  get lookupColumn(): ElideDimensionMetadataModel {
    if ('TABLE' === this.valueSourceType) {
      const lookupColumn = this.tableSource || '';
      return (this.naviMetadata.getById('dimension', lookupColumn, this.source) || this) as ElideDimensionMetadataModel;
    }
    return this;
  }

  get hasEnumValues(): boolean {
    return 'ENUM' === this.valueSourceType;
  }
}
