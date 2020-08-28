/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from './visualization';
import { parseMetricName } from 'navi-data/utils/metric';
import Model from '@ember-data/model';

interface FieldTypes {
  metric: 'metric';
  threshold: 'metric';
  dimension: 'dimension';
  dateTime: 'dateTime';
}
type LegacyFieldType = 'metric' | 'dateTime' | 'dimension';
type LegacyType = LegacyFieldType | 'threshold';
interface LegacyColumn<K extends LegacyType> {
  type: K;
  field?: string | ({ [T in FieldTypes[K]]: string } & { parameters?: Record<string, string> | undefined });
  displayName?: string;
  format?: string;
  hasCustomDisplayName?: boolean;
  sortDirection?: string;
  attributes: {
    canAggregateSubtotal?: boolean;
    field?: string;
    format?: string;
    name?: string;
    parameters?: Record<string, string>;
  };
}

export type TableColumnType = 'metric' | 'dimension' | 'timeDimension';
export interface TableColumn<K extends TableColumnType = TableColumnType> {
  type: K;
  field: string;
  parameters: Record<string, unknown>;
  attributes: {
    displayName?: string;
    canAggregateSubtotal?: boolean;
    format?: string;
  };
}

type TableVisMetadataPayload = {
  type: 'table';
  version: 1;
  metadata: {
    columns: LegacyColumn<LegacyType>[];
  };
};

function getNewColumnType(column: LegacyColumn<LegacyType>): TableColumnType {
  switch (column.type) {
    case 'threshold':
    case 'metric':
      return 'metric';
    case 'dateTime':
      return 'timeDimension';
    case 'dimension':
      return 'dimension';
  }
}

type Field = { field: string; parameters: Record<string, unknown> };
function getColumnField(column: LegacyColumn<LegacyFieldType>): Field {
  if (typeof column.field === 'string') {
    let { metric, parameters } = parseMetricName(column.field);
    return {
      field: metric,
      parameters: parameters || {}
    };
  } else if (typeof column.field === 'object') {
    return {
      field: column.field[column.type],
      parameters: column.field.parameters || {}
    };
  } else {
    return {
      field: column.attributes.name as string,
      parameters: column.attributes.parameters || {}
    };
  }
}

export default class TableVisualizationSerializer extends VisualizationSerializer {
  /**
   * Normalizes payload so that it can be applied to models correctly
   * @param type - class type as a DS model
   * @param visualization - json parsed object
   * @return {Object} normalized payload
   */
  normalize(type: Model, visualization: TableVisMetadataPayload) {
    debugger;
    if (visualization) {
      let columns: TableColumn[] = visualization.metadata?.columns.map(column => {
        column.type = column.type === 'threshold' ? 'metric' : column.type;
        const newCol = column as LegacyColumn<LegacyFieldType>;
        const { field, parameters } = getColumnField(newCol);
        const { attributes } = newCol;

        return {
          type: getNewColumnType(newCol),
          field,
          parameters,
          attributes: {
            canAggregateSubtotal: attributes.canAggregateSubtotal,
            displayName: column.hasCustomDisplayName ? column.displayName : undefined,
            format: column.format || attributes.format
          }
        };
      });
      // TODO: Fix subtotal and dateTime/grain
      Object.assign(visualization.metadata, { columns });
    }
    return super.normalize(type, visualization);
  }
}
