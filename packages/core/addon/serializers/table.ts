/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import VisualizationSerializer from './visualization';
import { parseMetricName, canonicalizeMetric } from 'navi-data/utils/metric';
import { RequestV2, Column } from 'navi-data/adapters/facts/interface';

interface FieldTypes {
  metric: 'metric';
  threshold: 'metric';
  dimension: 'dimension';
  dateTime: 'dateTime';
}
type LegacyType = keyof FieldTypes;
type LegacyFieldType = FieldTypes[LegacyType];
interface LegacyColumn<K extends LegacyType> {
  type: K;
  field?: string | ({ [T in FieldTypes[K]]: string } & { parameters?: Record<string, string> });
  displayName?: string;
  format?: string;
  hasCustomDisplayName?: boolean;
  sortDirection?: string;
  attributes?: {
    canAggregateSubtotal?: boolean;
    field?: string;
    format?: string;
    name?: string;
    parameters?: Record<string, string>;
  };
}

type LegacyMetadataColumn = LegacyColumn<'metric'> | LegacyColumn<'dateTime'> | LegacyColumn<'dimension'>;

export type TableVisMetadataPayloadV1 = {
  type: 'table';
  version: 1;
  metadata: {
    columns: (LegacyMetadataColumn | LegacyColumn<'threshold'>)[];
    showTotals?: {
      subtotal?: string;
      grandTotal?: boolean;
    };
  };
};

export interface TableColumnAttributes {
  canAggregateSubtotal?: boolean;
  format?: string;
}
export type TableVisualizationMetadata = {
  type: 'table';
  version: 2;
  metadata: {
    columnAttributes: {
      [cid: string]: TableColumnAttributes | undefined;
    };
    showTotals?: {
      subtotal?: string;
      grandTotal?: boolean;
    };
  };
};

type Field = { field: string; parameters: Record<string, unknown> };
/**
 *
 * @param column the
 */
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
      field: column.attributes?.name as string,
      parameters: column.attributes?.parameters || {}
    };
  }
}

type ColumnInfo = {
  requestIndex: number;
  requestColumn: Column;
  tableIndex: number;
  tableColumn: LegacyMetadataColumn;
};

/**
 * Builds a map of column canonical name to both request and visualization data
 * @param request the requested data for this table
 * @param visualization the existing visualization metadata
 */
function buildColumnInfo(request: RequestV2, visualization: TableVisMetadataPayloadV1): Record<string, ColumnInfo> {
  const columnData: Record<string, ColumnInfo> = {};
  request.columns.forEach((column, index) => {
    const { field, parameters } = column;
    const canonicalName = canonicalizeMetric({ metric: field, parameters });
    const data = columnData[canonicalName] || {};
    data.requestIndex = index;
    data.requestColumn = column;
    columnData[canonicalName] = data;
  });
  visualization?.metadata?.columns.forEach((column, index) => {
    column.type = column.type === 'threshold' ? 'metric' : column.type;
    const newCol = column as LegacyColumn<LegacyFieldType>;
    const { field, parameters } = getColumnField(newCol);
    let canonicalName = canonicalizeMetric({ metric: field, parameters });
    if (newCol.type === 'dateTime') {
      const { table } = request;
      const grain = request.columns.find(c => c.field === `${table}.dateTime`)?.parameters.grain;
      canonicalName = `${table}.${canonicalName}(grain=${grain || 'all'})`;
    } else if (newCol.type === 'dimension') {
      canonicalName = `${canonicalName}(field=id)`;
    }
    const data = columnData[canonicalName] || {};
    data.tableIndex = index;
    data.tableColumn = newCol;
    columnData[canonicalName] = data;
  });
  return columnData;
}

/**
 * Normalizes a table visualization by
 * - applying table order to request columns
 * - moving custom display names to aliases
 * - migrates existing attributes to a map based on column id
 * - moves subtotal to use column id
 * @param request the requested data for this table
 * @param visualization the existing visualization metadata
 */
export function normalizeTableV2(
  request: RequestV2,
  visualization: TableVisMetadataPayloadV1 | TableVisualizationMetadata
): TableVisualizationMetadata {
  if (visualization.version === 2) {
    return visualization;
  }

  const columnData: Record<string, ColumnInfo> = buildColumnInfo(request, visualization);

  // Rearranges request columns to match table order
  request.columns = Object.values(columnData).reduce((columns, columnInfo) => {
    const { tableColumn, tableIndex, requestColumn } = columnInfo;
    if (tableColumn.hasCustomDisplayName) {
      // If display name is custom move over to request
      requestColumn.alias = tableColumn.displayName;
    }
    columns[tableIndex] = requestColumn;
    return columns;
  }, [] as Column[]);

  // extract column attributes
  const columnAttributes = Object.values(columnData).reduce((columns, columnInfo) => {
    const { tableColumn, requestColumn } = columnInfo;
    const { attributes } = tableColumn;
    columns[requestColumn.cid] = {
      canAggregateSubtotal: tableColumn.type === 'metric' ? attributes?.canAggregateSubtotal : undefined,
      format: tableColumn.format !== undefined ? tableColumn.format : attributes?.format
    };
    return columns;
  }, {} as Record<string, TableColumnAttributes>);

  // update subtotal to use column index
  const { showTotals } = visualization?.metadata || {};
  let subtotal;
  if (showTotals?.subtotal) {
    let canonicalName;
    if (showTotals?.subtotal === 'dateTime') {
      const { table } = request;
      const grain = request.columns.find(c => c.field === `${table}.dateTime`)?.parameters.grain;
      canonicalName = `${table}.dateTime(grain=${grain || 'all'})`;
    } else {
      canonicalName = `${showTotals.subtotal}(field=id)`;
    }
    subtotal = columnData[canonicalName].requestColumn.cid;
  }

  return {
    type: 'table',
    version: 2,
    metadata: {
      columnAttributes,
      showTotals: {
        subtotal,
        grandTotal: showTotals?.grandTotal
      }
    }
  };
}

export default class TableVisualizationSerializer extends VisualizationSerializer {
  // TODO: Implement serialize method to strip out unneeded fields
}
