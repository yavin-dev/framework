/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ColumnMetadataModel from 'navi-data/models/metadata/column';
import type { ColumnInstance, ColumnMetadataPayload, ColumnType } from 'navi-data/models/metadata/column';
import type { Cardinality } from '@yavin/client/utils/enums/cardinality-sizes';
import type { Parameters } from '@yavin/client/request';
import { ValueSourceType } from './elide/dimension';
import { Injector } from '../native-with-create';

interface Field {
  name: string;
  longName?: string;
  description?: string;
  tags?: string[];
}

export type SuggestionColumn = { id: string; parameters?: Parameters };
export type TableSource = {
  valueSource?: string;
  suggestionColumns?: SuggestionColumn[];
};

// Shape passed to model constructor
export interface DimensionMetadataPayload extends ColumnMetadataPayload {
  tableSource?: TableSource;
  fields?: Field[];
  cardinality?: Cardinality;
  valueSourceType: ValueSourceType;
}

export type DimensionColumn = ColumnInstance<DimensionMetadataModel>;

export default class DimensionMetadataModel extends ColumnMetadataModel {
  static identifierField = 'id';

  constructor(injector: Injector, args: DimensionMetadataPayload) {
    super(injector, args);
  }

  metadataType: ColumnType = 'dimension';

  /**
   * Array of field objects
   */
  declare fields?: Field[];

  /**
   * name of the primary key tag
   */
  private primaryKeyTag = 'primaryKey';

  /**
   * name of the description tag
   */
  private descriptionTag = 'description';

  /**
   * name of the searchable id tag
   */
  private idTag = 'id';

  /**
   * the cardinality size of the dimension
   */
  declare cardinality?: Cardinality;

  declare tableSource?: TableSource;

  declare valueSourceType: ValueSourceType;

  /**
   * Fetches tags for a given field name
   *
   * @param fieldName - name of the field to query tags
   */
  getTagsForField(fieldName: string): string[] {
    const field = this.fields?.find((f) => f.name === fieldName);

    return field?.tags || [];
  }

  /**
   * Fetches fields for a given tag
   *
   * @param tag - name of tag
   */
  getFieldsForTag(tag: string): Field[] {
    return (
      this.fields?.filter((field) => {
        return field.tags?.includes(tag);
      }) || []
    );
  }

  get primaryKeyFieldName(): string {
    const { primaryKeyTag: tag } = this;
    const field = this.getFieldsForTag(tag)?.[0];
    return field?.name || 'id';
  }

  get descriptionFieldName(): string {
    const { descriptionTag: tag } = this;
    const field = this.getFieldsForTag(tag)?.[0];
    return field?.name || 'desc';
  }

  get idFieldName(): string {
    const { idTag: tag } = this;
    const field = this.getFieldsForTag(tag)?.[0];
    return field?.name || this.primaryKeyFieldName;
  }

  /**
   * extended metadata for the dimension that isn't provided in initial table fullView metadata load
   */
  get extended(): Promise<DimensionMetadataModel> {
    const { naviMetadata, id, source } = this;
    return naviMetadata.findById('dimension', id, source).then((d) => d || this);
  }

  get suggestionColumns(): SuggestionColumn[] {
    return this.tableSource?.suggestionColumns ?? [];
  }
}

declare module 'navi-data/models/metadata/registry' {
  export default interface MetadataModelRegistry {
    dimension: DimensionMetadataModel;
  }
}
