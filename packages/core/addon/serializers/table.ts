/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import VisualizationSerializer from './visualization';
import { parseMetricName, canonicalizeMetric } from 'navi-data/utils/metric';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import type { RequestV2, Column } from 'navi-data/adapters/facts/interface';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import { getRealDimensionType } from 'navi-core/utils/request';

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

type Field = { field: string; parameters: Record<string, string> };
/**
 *
 * @param column the
 */
function getColumnField(column: LegacyColumn<LegacyFieldType>): Field {
  if (typeof column.field === 'string') {
    let { metric, parameters } = parseMetricName(column.field);
    return {
      field: metric,
      parameters: parameters || {},
    };
  } else if (typeof column.field === 'object') {
    return {
      field: column.field[column.type],
      parameters: column.field.parameters || {},
    };
  } else {
    return {
      field: column.attributes?.name as string,
      parameters: column.attributes?.parameters || {},
    };
  }
}

type ColumnInfo =
  | { requestIndex: number; requestColumn: Column; tableIndex: number; tableColumn: LegacyMetadataColumn }
  | {
      // These could be undefined if the table was not updated properly and tried to display a column that no longer existed
      requestIndex: undefined;
      requestColumn: undefined;
      tableIndex: number;
      tableColumn: LegacyMetadataColumn;
    }
  | {
      requestIndex: number;
      requestColumn: Column;
      // These can be undefined since converting an all grain request will add a request column with no corresponding table column
      tableIndex: undefined;
      tableColumn: undefined;
    };

/**
 * Builds a map of column canonical name to both request and visualization data
 * @param request the requested data for this table
 * @param visualization the existing visualization metadata
 */
function buildColumnInfo(
  request: RequestV2,
  visualization: TableVisMetadataPayloadV1,
  naviMetadata: NaviMetadataService
): Record<string, ColumnInfo> {
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
      const grain = request.columns.find((c) => c.field === `${table}.dateTime`)?.parameters.grain;
      canonicalName = `${table}.${canonicalName}(grain=${grain})`;
    } else if (newCol.type === 'dimension') {
      const type = getRealDimensionType(field, request.dataSource, naviMetadata);
      const requestColumn = request.columns.find((c) => c.type === type && c.field === field);
      const fieldParam = column.attributes?.field ?? requestColumn?.parameters.field;
      assert(`field param must be found for dimension ${canonicalName}`, fieldParam);
      const newParams = {
        ...requestColumn?.parameters,
        field: fieldParam,
      };
      canonicalName = canonicalizeMetric({ metric: field, parameters: newParams });
    }
    const data = columnData[canonicalName] || {};
    data.tableIndex = index;
    data.tableColumn = newCol;
    columnData[canonicalName] = data;
  });
  return columnData;
}

/**
 * The legacy table visualization would display by checking the following rules
 * - 1) If the dimension had `show` fields -> make them individual columns (e.g. [Dim (key), Dim (desc)])
 * - 2) If the desc field was available    -> show it (with id only on hover)
 * - 3) If the id field was available      -> show it
 * @param request - the requested data for this table
 * @param metadata - the metadata service with the datasource already loaded
 */
function injectDimensionFields(request: RequestV2, naviMetadata: NaviMetadataService) {
  const newColumns: RequestV2['columns'] = [];
  request.columns.forEach((col) => {
    const { type, field } = col;
    if (type === 'dimension') {
      const dimMeta = naviMetadata.getById(type, field, request.dataSource);
      // get all show fields for dimension
      let showFields = dimMeta?.getFieldsForTag('show').map((f) => f.name) ?? [];
      if (showFields.length === 0) {
        const allFields = dimMeta?.fields?.map((f) => f.name);
        let bestField: string;
        if (allFields) {
          // Use desc or id if available. If neither match grab the first field
          bestField = ['desc', 'id'].find((idOrDesc) => allFields.includes(idOrDesc)) ?? allFields[0];
        } else {
          bestField = 'desc'; // default to desc
        }
        showFields = [bestField];
      }
      showFields.forEach((field) => {
        newColumns.push({
          ...col,
          parameters: {
            ...col.parameters,
            field,
          },
        });
      });
    } else {
      newColumns.push(col);
    }
  });

  request.columns = newColumns;
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
  visualization: TableVisMetadataPayloadV1 | TableVisualizationMetadata,
  naviMetadata: NaviMetadataService
): TableVisualizationMetadata {
  if (visualization.version === 2) {
    return visualization;
  }

  injectDimensionFields(request, naviMetadata);
  const columnData: Record<string, ColumnInfo> = buildColumnInfo(request, visualization, naviMetadata);

  // Rearranges request columns to match table order
  const missedRequestColumns: Column[] = [];
  const reorderedColumns = Object.values(columnData)
    .reduce((columns: Column[], columnInfo) => {
      const { tableColumn, tableIndex, requestColumn } = columnInfo;
      if (requestColumn && tableColumn) {
        // this column exists in request and table
        assert('Table index must exist if table column exists', tableIndex !== undefined);
        if (tableColumn.hasCustomDisplayName) {
          // If display name is custom move over to request
          requestColumn.alias = tableColumn.displayName;
        }
        columns[tableIndex] = requestColumn;
      } else if (requestColumn !== undefined && tableColumn === undefined) {
        // this column only exists in the request
        missedRequestColumns.push(requestColumn);
      }
      return columns;
    }, [])
    .filter((c) => c); // remove skipped columns
  request.columns = [...reorderedColumns, ...missedRequestColumns];

  // extract column attributes
  const columnAttributes = Object.values(columnData).reduce((columns, columnInfo) => {
    const { tableColumn, requestColumn } = columnInfo;
    if (tableColumn === undefined || requestColumn === undefined) {
      // this column does not exist in the table
      return columns;
    }
    const { attributes } = tableColumn;
    assert(
      `The request column ${requestColumn.field} should have a present 'cid' field`,
      requestColumn.cid !== undefined
    );
    const canAggregateSubtotal = tableColumn.type === 'metric' ? attributes?.canAggregateSubtotal : undefined;
    const format = tableColumn.format !== undefined ? tableColumn.format : attributes?.format;
    columns[requestColumn.cid] = {
      ...(canAggregateSubtotal !== undefined ? { canAggregateSubtotal } : {}),
      ...(!isEmpty(format) ? { format } : {}),
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
      const grain = request.columns.find((c) => c.field === `${table}.dateTime`)?.parameters.grain;
      canonicalName = `${table}.dateTime(grain=${grain})`;
    } else {
      const dimensionField = request.columns.find((c) => c.field === showTotals.subtotal)?.parameters.field;
      canonicalName = `${showTotals.subtotal}(field=${dimensionField})`;
    }
    subtotal = columnData[canonicalName].requestColumn?.cid;
  }

  return {
    type: 'table',
    version: 2,
    metadata: {
      columnAttributes,
      showTotals: {
        ...(subtotal !== undefined ? { subtotal } : {}),
        ...(showTotals?.grandTotal !== undefined ? { grandTotal: showTotals?.grandTotal } : {}),
      },
    },
  };
}

export default class TableVisualizationSerializer extends VisualizationSerializer {
  // TODO: Implement serialize method to strip out unneeded fields
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    table: TableVisualizationSerializer;
  }
}
